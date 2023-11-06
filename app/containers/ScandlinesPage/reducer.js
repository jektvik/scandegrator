import { fromJS } from 'immutable'

import {
	LOAD_DEPARTURES,
	DEPARTURES_BATCH_LOADED,
	LOAD_DEPARTURES_ERROR,
	DEPARTURES_ALL_LOADED,
	ERASE_DEPARTURES
} from './constants'

// The initial state of the App
const initialState = fromJS({
	loading: false,
	error: false,
	departures: []
})

function scandlinesReducer(state = initialState, action) {
	switch (action.type) {
		case LOAD_DEPARTURES:
			return state
				.set('loading', true)
				.set('error', false)
		case DEPARTURES_BATCH_LOADED:
			return state
				.set('departures', action.departures)
		case DEPARTURES_ALL_LOADED:
			return state
				.set('loading', false)
		case LOAD_DEPARTURES_ERROR:
			return state
				.set('error', action.error)
				.set('loading', false)
		case ERASE_DEPARTURES:
			return state
				.set('departures', [])
		default:
			return state
	}
}

export default scandlinesReducer
