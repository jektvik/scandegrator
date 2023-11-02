
import React from 'react'
import { Helmet } from 'react-helmet'
import './style.scss'
import moment from 'moment'
import DeparturesTable from './Components/DeparturesTable'
import DeparturesRequestForm from 'containers/ScandlinesPage/Components/DeparturesRequestForm'

export default class ScandlinesPage extends React.PureComponent {

	render() {
		const departures = this.props.departures
		departures && departures.sort((a, b) => {
			var check = moment(a.departureDateTime).isAfter(moment(b.departureDateTime))
			return check ? 1 : !check ? -1 : 0
		})

		return (
			<article>
				<Helmet>
					<title>Scandegrator</title>
					<meta name="description" content="An aggregator of most affordable Scandlines ferry tickets" />
				</Helmet>
				<DeparturesRequestForm
					onLoadDepartures={this.props.onLoadDepartures}
				/>
				<div className="home-page">
					<section className="centered">
						<h2>Find your cheapest Scandlines tickets</h2>
						<p>A minimal <i>web-based</i> cheap ticket aggregegator</p>
					</section>
					<section>
						<DeparturesTable
							departures={departures}
							loadingDepartures={this.props.loadingDepartures}
						/>
					</section>
				</div>
			</article>
		)
	}
}

