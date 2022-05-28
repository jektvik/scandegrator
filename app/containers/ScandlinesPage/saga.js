import { call, put, select, takeLatest, fork, join } from 'redux-saga/effects'
import { LOAD_DEPARTURES } from './constants'
import { departuresBatchLoaded, departuresLoadingError, allDeparturesLoaded } from './actions'
import request from 'utils/request'
import { makeSelectDepartures } from './selectors'
import moment from 'moment'
import lodash from 'lodash-es'

export function* requestDepartures(action) {
	try {
		const formValues = action.formValues
		const fromDate = moment(formValues.fromDate)
		const toDate = moment(formValues.toDate).add(1, 'days')
		const route = formValues.route
		const requestURL = '/api/scandlines'
		const firstRequestDate = moment(fromDate)

		let requestDate = moment(firstRequestDate)
		let forks = []
		while (moment(toDate).isAfter(requestDate)) {
			const requestOptions = getRequestOptions(requestDate, route)
			forks.push(yield fork(processDeparturesPayload, { requestURL, requestOptions }))
			requestDate = moment(requestDate).add(60, 'minutes')
		}
		yield join(forks)
		yield put(allDeparturesLoaded())
	} catch (err) {
		console.log(err)
		yield put(departuresLoadingError(err))
	}
}

function getRequestOptions(requestDate, route) {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			'route': route,
			'year': requestDate.toObject().years,
			'month': requestDate.toObject().months,
			'day': requestDate.toObject().date,
			'hour': requestDate.toObject().hours,
			'minute': requestDate.toObject().minutes,
			'second': requestDate.toObject().seconds
		})
	}
}

function* processDeparturesPayload({ requestURL, requestOptions }) {
	const response = yield call(request, requestURL, requestOptions)
	const departuresOnResponse = response.flatMap(response => response.outboundDepartures)
	const departuresInState = yield select(makeSelectDepartures())
	const allDepartures = [...departuresOnResponse, ...departuresInState]
	const uniqueDepartures = lodash.uniqBy(allDepartures, (c) => {
		return c.departureDateTime
	})

	const sortedDepartures = uniqueDepartures.sort((a, b) => moment(a.departureDateTime).isAfter(moment(b.departureDateTime)))
	yield put(departuresBatchLoaded(sortedDepartures))
}

export default function* sagaMain() {
	yield takeLatest(LOAD_DEPARTURES, requestDepartures)
}
