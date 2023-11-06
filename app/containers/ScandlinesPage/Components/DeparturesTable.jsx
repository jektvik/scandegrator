import React from 'react'
import moment from 'moment'

import ReactTableOld from 'react-table'
import 'react-table/react-table.css'
import { BeatLoader } from 'react-spinners'
import './style.scss'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'

import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	flexRender,
} from '@tanstack/react-table'

import TablePaginationActions from './actions'

const columns = [
	{
		header: 'Departures',
		//   footer: props => props.column.id,
		columns: [
			{
				header: 'Date',
				accessor: d => moment(d.departureDateTime).format('DD-MMM-YYYY'),
				id: 'date',
				// cell: info => info.getValue(),
				footer: props => props.column.id,
			},
			{
				header: 'Time',
				accessor: row => row.lastName,
				id: 'time',
				cell: info => info.getValue(),
				footer: props => props.column.id,
			},
		],
	}
]

export default function DeparturesTable (props) {

	const renderPrice = (price) => {
		return <div>
			{price.value && price.value + ' €' || 'sold out'}
		</div>
	}

	const renderHeader = () => {
		return (<React.Fragment>
			Departures
			<BeatLoader
				className='spinner'
				sizeunit={'px'}
				size={10}
				color={'#41ADDD'}
				loading={props.loadingDepartures}
			> </BeatLoader>
		</React.Fragment>)
	}

	const renderAnchor = (row) => {
		return <a href={row.value} target="_blank" rel='noreferrer noopener'>
			Link
		</a>
	}

	const encodeQuery = (input) => {
		const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$-='
		if (input == null || input == '') return ''
		var output = ''
		var chr1, chr2, chr3
		var enc1, enc2, enc3, enc4
		var i = 0
		do {
			chr1 = input.charCodeAt(i++)
			chr2 = input.charCodeAt(i++)
			chr3 = input.charCodeAt(i++)
			enc1 = chr1 >> 2
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
			enc4 = chr3 & 63
			if (isNaN(chr2)) {
				enc3 = enc4 = 64
			} else if (isNaN(chr3)) {
				enc4 = 64
			}
			output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4)

		} while (i < input.length)
		return output
	}

	const getUrlForDeparture = (departure) => {
		var query = 'isreturn=false'
		query += '|vehiclecode=CAR'

		query += '|adults=1'
		query += '|children=0|infants=0'
		query += '|outroute=' + departure.route
		query += '|outschedule=' + departure.departureDateTime
		query += '|homeroute=' + departure.route
		query += '|homeschedule=' + departure.departureDateTime
		query = encodeQuery(query)

		const url = 'https://booking.scandlines.com/TripView?mandator=SAS&lang=da&query=' + query
		return url
	}

	const getDeparturesWithLinks = (departures) => {
		departures.forEach(departure => {
			departure.url = getUrlForDeparture(departure)
		})
		return departures
	}

	const getDeparturesWithCheapestTicket = (departures) => {
		departures.forEach(departure => {
			departure.cheapestTicket = departure.availableTickets[0] && departure.availableTickets.sort((a, b) => a.price > b.price)[0].price
		})
		//		{departure.availableTickets[0] && ' €' || 'sold out'}
		return departures
	}
	const { departures } = props
	const departuresWithLinks = departures && getDeparturesWithLinks(departures)
	const decoratedDepartures = departuresWithLinks && getDeparturesWithCheapestTicket(departuresWithLinks)


	const table = useReactTable({
		data: decoratedDepartures,
		columns,
		// Pipeline
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		//
		debugTable: true,
	})
	const { pageSize, pageIndex } = table.getState().pagination

	return (
		<React.Fragment>
			<ReactTableOld
				data={decoratedDepartures || []}
				columns={[
					{
						Header: renderHeader,
						accessor: d => d.departureDateTime,
						columns: [
							{
								Header: 'Date',
								id: 'data',
								accessor: d => moment(d.departureDateTime).format('DD-MMM-YYYY')
							},
							{
								Header: 'Time',
								id: 'time',
								accessor: d => moment(d.departureDateTime).format('HH:mm')
							},
							{
								Header: 'Weekday',
								id: 'weekday',
								accessor: d => moment(d.departureDateTime).format('dddd')
							},
							{
								Header: 'Lowest Price',
								id: 'price',
								accessor: d => d.cheapestTicket,
								Cell: renderPrice
							},
							{
								Header: 'Url',
								id: 'url',
								accessor: d => d.url,
								Cell: renderAnchor
							},
						]
					}
				]}
				showPageSizeOptions={false}
				showPagination={false}
				minRows={5}
				pageSize={decoratedDepartures && decoratedDepartures.length > 5 ? decoratedDepartures.length : 5}
				className="-striped -highlight"
				noDataText='Load departure data to populate table'
				style={{
					maxHeight: '500px' // This will force the table body to overflow and scroll, since there is not enough room
				}}
			>
			</ReactTableOld>
			<br />
			<Box sx={{ width: '100%' }}>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							{table.getHeaderGroups().map(headerGroup => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map(header => {
										return (
											<TableCell key={header.id} colSpan={header.colSpan}>
												{header.isPlaceholder ? null : (
													<div>
														{flexRender(
															header.column.columnDef.header,
															header.getContext()
														)}
													</div>
												)}
											</TableCell>
										)
									})}
								</TableRow>
							))}
						</TableHead>
						<TableBody>
							{table.getRowModel().rows.map(row => {
								return (
									<TableRow key={row.id}>
										{row.getVisibleCells().map(cell => {
											return (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</TableCell>
											)
										})}
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25, { label: 'All', value: decoratedDepartures.length }]}
					component="div"
					count={table.getFilteredRowModel().rows.length}
					rowsPerPage={pageSize}
					page={pageIndex}
					SelectProps={{
						inputProps: { 'aria-label': 'rows per page' },
						native: true,
					}}
					onPageChange={(_, page) => {
						table.setPageIndex(page)
					}}
					onRowsPerPageChange={e => {
						const size = e.target.value ? Number(e.target.value) : 10
						table.setPageSize(size)
					}}
					ActionsComponent={TablePaginationActions}
				/>
				<pre>{JSON.stringify(table.getState().pagination, null, 2)}</pre>
			</Box>
		</React.Fragment>
	)
}

