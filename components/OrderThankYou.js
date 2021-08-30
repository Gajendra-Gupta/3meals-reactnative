import React from 'react';
import { Animated, Modal, Text, Image, Dimensions, StyleSheet, View, TouchableHighlight, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import i18n from '../i18n/config';
import { APPFONTMEDIUM, GOOGLEAPIKEY, APPCOUNTRY, MODALBODYCOLOR, APPDEFAULTMAPSCOORD, HOMEHEADINGCOLOR, PRIMARYBUTTONCOLOR, SECONDARYBUTTONSCOLOR, API_URL, SECONDARYBUTTONSTEXTCOLOR, STATUSBARCOLOR, APPFONTBOLD, BOTTOMTABSICONSCOLOR } from '../config';
import { connect } from 'react-redux';
import SvgPlaceholder from '../assets/images/Placeholder';
import iconHome from '../assets/images/Icon-home.png';
import MapViewDirections from 'react-native-maps-directions';
import SvgCompass from '../assets/images/Compass';
import MapView, { Marker } from 'react-native-maps';


const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');


modal_height = (percentage) => {
	const value = (percentage * viewportHeight) / 100;
	return Math.round(value);
};

const { width, height } = Dimensions.get('window');

//const origin = { latitude: 37.3318456, longitude: -122.0296002 };
//const destination = { latitude: 37.771707, longitude: -122.4053769 };
const GOOGLE_MAPS_APIKEY = '…';



class OrderThankYou extends React.Component {


	interval;

	state = {
		loadingLocation: false,
		locationDetected: false,
		latitude: null,
		longitude: null,
		duration: ''
	}

	componentDidMount = () => {
		//console.log("OrderThankYou componentDidMount")
		this.getDriverData();

		if (this.interval)
			clearInterval(this.interval);

		this.interval = setInterval(() => {
			//console.log("openOrderCompleteModal", this.props.navigation.getParam("openOrderCompleteModal"))
			if (this.props.navigation.getParam("openOrderCompleteModal")) {
				this.getDriverData();
			}
		}, 10000);
	}

	componentDidUpdate = (prevProps, prevState) => {
		//console.log("OrderThankYou componentDidUpdate");
		//this.getDriverData();
	}

	async getDriverData() {
				
		let req = { "order_id": this.props.order_id }		

		let response = await fetch(API_URL + "driverAPI/get_order_driver.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(req)
		});
		let json = await response.json();	
		
		if (json.data) {
			let item = json.data[0]
			const driver = {
				name: item.first_name + " " + item.last_name,
				image: item.profile_image,
				phone: item.phone_no,
				order_status: item.order_status,
				location: { latitude: parseFloat(item.latitude), longitude: parseFloat(item.longitude) }
			}
			
			this.setState({ driver: driver });
			if (item.order_status == 1) {
				this.props.updateStatus();
				clearInterval(this.interval);				
			}
		}

	}

	mapView = null;

	_mapViewConfig = () => {
		const lat = this.state.latitude ? parseFloat(this.state.latitude) : parseFloat(this.props.mapregion[0]);
		const lng = this.state.longitude ? parseFloat(this.state.longitude) : parseFloat(this.props.mapregion[1]);
		const defaultRegion = { latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };
		if (this.props.locationClicked || this.state.locationDetected) {
			return { region: defaultRegion }
		} else {
			return { initialRegion: defaultRegion }
		}
	};

	onReady = (result) => {
		//("duration", parseInt(result.duration))
		this.setState({ duration: parseInt(result.duration) })
		this.mapView.fitToCoordinates(result.coordinates, {
			edgePadding: {
				right: (width / 10),
				bottom: (height / 10),
				left: (width / 10),
				top: (height / 10),
			},
		});
	}

	setDistance(distance, duration_in_traffic) {
		// console.log('setDistance');
		this.setState({
			distance: parseFloat(distance),
			durationInTraffic: parseInt(duration_in_traffic)
		});
	}

	render() {
		const vendorData = this.props.vendorData;
		const customerData = this.props.customerData;
		const order_id = this.props.order_id;
		const order_preparation_time = this.props.pre_time;
		/* const vendorData = {
			name: "Kebab Master",
			address: "Greenwich Street, NY, New York, USA",
			address_geo: "40.7219357,-74.0098003",
		}; */


		//let sourceLat = this.props.searchcoords.split(",")[0];
		//let sourceLng = this.props.searchcoords.split(",")[1];


		console.log("customerData",customerData);
		console.log("vendorData",vendorData);

		let sourceLat = 0, sourceLng = 0;
		if (customerData && customerData.address_geo) {
			sourceLat = customerData.address_geo.split(",")[0];
			sourceLng = customerData.address_geo.split(",")[1];
		}

		let destLat = 0, destLng = 0;
		if (vendorData && vendorData.address_geo) {
			destLat = vendorData.address_geo.split(",")[0];
			destLng = vendorData.address_geo.split(",")[1];
		}

		const origin = { latitude: parseFloat(sourceLat), longitude: parseFloat(sourceLng) };
		let destination = { latitude: parseFloat(destLat), longitude: parseFloat(destLng) };

		//console.log("location", this.state.driver);
		console.log("order_preparation_time", order_preparation_time);

		if (this.state.driver)
			destination = { latitude: parseFloat(this.state.driver.location.latitude), longitude: parseFloat(this.state.driver.location.longitude) };

		if (this.state.driver && this.state.driver.order_status == 1)
			return (
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.props.show == true}
					onRequestClose={() => {
						this.props.navigation.setParams({ openOrderCompleteModal: false });
					}}
				>
					<View style={styles.modalBodyWrapper}>
						<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.setParams({ openOrderCompleteModal: false }) }}>
							<View style={{ height: '70%' }} />
						</TouchableHighlight>



						<View style={styles.modalBody}>

							<Image source={require('../assets/images/order_success.png')} style={{ marginTop: 20, height: 100, width: 100 }} />

							<Text style={styles.title}>{i18n.t('ORDERTHANKYOU_OrderCompleted')}</Text>

							<Text style={styles.subTitle}>{i18n.t('ORDERTHANKYOU_MSG_Completed', { restaurant_name: vendorData ? vendorData.name : '', delivery_time: order_preparation_time})}</Text>
						</View>

					</View>
				</Modal >
			);
		else
			return (
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.props.show == true}
					onRequestClose={() => {
						this.props.navigation.setParams({ openOrderCompleteModal: false });
					}}
				>
					<View style={styles.modalBodyWrapper}>
						<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.setParams({ openOrderCompleteModal: false }) }}>
							<View style={styles.separator} />
						</TouchableHighlight>



						<View style={styles.modalBody}>

							<View style={styles.mapContainer}>

								<MapView
									style={styles.map}
									initialRegion={{ latitude: origin.latitude, longitude: origin.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
									ref={c => this.mapView = c}>

									<Marker coordinate={origin}><Image source={require('../assets/images/Icon-home.png')} resizeMode='contain' style={{ height: 50, width: 50 }} /></Marker>
									{this.state.driver ? (
										<Marker coordinate={destination}><Image source={require('../assets/images/marker_deliveryboy.png')} resizeMode='contain' style={{ height: 50, width: 50 }} /></Marker>
									) : (
										<Marker coordinate={destination}><Image source={require('../assets/images/Icon-restaurant.png')} resizeMode='contain' style={{ height: 50, width: 50 }} /></Marker>
									)}



									<MapViewDirections
										origin={origin}
										destination={destination}
										apikey={GOOGLEAPIKEY}
										mode='DRIVING'
										strokeWidth={5}
										optimizeWaypoints={true}
										strokeColor="green"
										onReady={this.onReady}
										timePrecision='now'
									/>
								</MapView>
								{/* <View style={styles.marker}><SvgPlaceholder width={32} height={32} /></View> */}
							</View>
							<View style={styles.titleTime}>
								{/* <Feather name='shopping-bag' style={styles.titleIcon} /> */}
								<Text style={{ fontWeight: 'bold', fontSize: 20 }}>{order_preparation_time  ? order_preparation_time + ' min' : '-'} </Text>
							</View>

							{this.state.driver ? (
								<Text style={styles.title}>{i18n.t('ORDERTHANKYOU_OrderPicked')}</Text>
							) : (
								<Text style={styles.title}>{i18n.t('ORDERTHANKYOU_OrderReceived')}</Text>
							)}

							{this.state.driver ? (
								<Text style={styles.subTitle}>{i18n.t('ORDERTHANKYOU_MSG_Picked', { restaurant_name: vendorData ? vendorData.name : '', delivery_time: order_preparation_time})}</Text>
							) : (
								<Text style={styles.subTitle}>{i18n.t('ORDERTHANKYOU_MSG_Received', { restaurant_name: vendorData ? vendorData.name : '', delivery_time: order_preparation_time })}</Text>
							)}


							{this.state.driver ? (
								<Text style={styles.driver_head}>Driver Details</Text>
							) : null}

							{this.state.driver ? (
								<View>
									<View style={styles.driver_back}>
										<Image source={{ uri: API_URL + 'driverAPI/' + this.state.driver.image }} resizeMode='cover' style={styles.image} />
										<Text style={styles.driver_name}>{this.state.driver.name}</Text>
										<TouchableHighlight underlayColor='transparent' onPress={() => { Linking.openURL('tel://' + this.state.driver.phone) }} ><Text style={styles.storeCallLink}><Feather name='phone-call' style={styles.callBtnIcon} /></Text></TouchableHighlight>
									</View>
								</View>
							) : null}




						</View>

					</View>
				</Modal >
			);
	}
}

const styles = StyleSheet.create({
	modalBodyWrapper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
	},
	separator: {
		height: modal_height(20),
	},
	modalBody: {
		flex: 1,
		backgroundColor: MODALBODYCOLOR,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
		position: 'relative',
		alignItems: 'center'
	},
	titleIconWrapper: {
		paddingTop: 16,
		textAlign: 'center',
	},
	titleTime: {
		width: 100,
		height: 100,
		backgroundColor: 'white',
		borderRadius: 50,
		borderColor: 'gray',
		borderWidth: 3,
		alignItems: 'center',
		justifyContent: 'center',
		alignContent: 'center',
		marginTop: 20
	},
	titleIcon: {
		fontSize: 56,
		color: '#1e1e1e',
	},
	title: {
		fontFamily: APPFONTMEDIUM,
		fontSize: 24,
		color: '#000',
		fontWeight: 'bold',
		padding: 16,
		textAlign: 'center',
		textTransform: 'uppercase'
	},
	subTitle: {
		fontFamily: APPFONTMEDIUM,
		fontSize: 16,
		color: '#1e1e1e',
		textAlign: 'center',
		marginLeft: 40,
		marginRight: 40,
		marginBottom: 20
	},
	mapContainer: {
		height: 200,
		width: '100%',
		justifyContent: 'flex-end',
		alignItems: 'center',
		flex: 1,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	marker: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -34,
		marginLeft: -16,
	},
	mapIcon: {
		fontSize: 24,
		color: SECONDARYBUTTONSCOLOR,
	},
	image: {
		height: 50,
		width: 50,
		borderRadius: 25
	},
	driver_head: {
		fontFamily: APPFONTBOLD,
		fontSize: 16,
		color: '#1e1e1e',
		paddingLeft: 30,
		width: '100%'
	},
	driver_name: {
		fontFamily: APPFONTMEDIUM,
		fontSize: 16,
		color: '#1e1e1e',
		marginLeft: 20,
		flex: 1,
	},
	callBtnIcon: {
		fontSize: 24,
		color: 'black',
		textAlign: 'center',
	},
	driver_back: {
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		flexDirection: 'row',
		alignItems: 'center',
		width: '90%',
		backgroundColor: 'white',
		padding: 10,
		marginTop: 5,
		marginBottom: 10
	}
});

const mapStateToProps = state => {
	let mainregion = APPDEFAULTMAPSCOORD;

	if (state.userLocationCoords) {
		mainregion = state.userLocationCoords;
	} else if (state.userLocalityCoords) {
		mainregion = state.userLocalityCoords;
	}

	const regionobject = mainregion.split(',');

	return {
		mapregion: regionobject,
		searchcoords: state.userLocalityCoords ? state.userLocalityCoords : APPDEFAULTMAPSCOORD,
		userLocation: state.userLocation,
		userLocationSet: state.userLocationSet,
		locationClicked: state.locationClicked,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		setUserLocation: (currentloc, loccoords, locationClicked) => dispatch({ type: 'SETUSERLOCATION', loc: currentloc, coords: loccoords, locclicked: locationClicked })
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderThankYou);
