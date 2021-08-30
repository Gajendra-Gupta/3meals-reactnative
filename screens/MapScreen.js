import React from 'react';
import { Text, View, ScrollView, Platform, StyleSheet, Button, TextInput, Alert, TouchableHighlight, PermissionsAndroid, ToastAndroid } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView from 'react-native-maps';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { connect } from 'react-redux';
import Geocoder from 'react-native-geocoding';
import { APPFONTMEDIUM, GOOGLEAPIKEY, APPCOUNTRY, APPDEFAULTMAPSCOORD, PRIMARYBUTTONTEXTCOLOR, PRIMARYBUTTONCOLOR, SECONDARYBUTTONSCOLOR } from '../config';
import Feather from 'react-native-vector-icons/Feather';
import SvgPlaceholder from '../assets/images/Placeholder';
import IosStatusBar from '../components/IosStatusBar';
import i18n from '../i18n/config';
import Geolocation from 'react-native-geolocation-service';
import { Loading } from '../components/Loading'; 

let dragTimeOut;

class MapScreen extends React.Component {
	
	state = {
		loadingLocation: false,
		locationDetected: false,
		latitude: null,
		longitude: null,
	}
	
	_addressOnClick = (data, details = null) => {
		const locationcoordsraw = details.geometry.location;
		const locationcoords = locationcoordsraw.lat+','+locationcoordsraw.lng;
		const locationformatted = details.formatted_address;
		this.setState({loadingLocation: false, locationDetected: false, latitude : null, longitude : null}, () => {
			this.props.setUserLocationOnly(locationformatted, locationcoords, true);
		});
		//this.props.setUserLocationOnly(locationformatted, locationcoords, true);
	};

	componentDidMount = () => {
		Geocoder.init(GOOGLEAPIKEY);
		this._getLocation();
	}


	
	_regionChanged = (data) => {
		clearTimeout(dragTimeOut);
		
		this.setState({loadingLocation: true}, () => {
			dragTimeOut = setTimeout(() => {
				const locationcoords = data.latitude+','+data.longitude;
				
				Geocoder.from(locationcoords)
				.then(json => {
					const address = json.results[0].formatted_address;
					if (address && this.locationSearchInputRef) {
						this.locationSearchInputRef.setAddressText(address);						
						this.setState({loadingLocation: false, locationDetected: false}, () => {													
							this.props.setUserLocationOnly(address, locationcoords, false);
						});
					}
				})
				.catch(error => console.log(error));
			}, 100)
		});
	};
	
	_hasLocationPermission = async () => {
		if (Platform.OS === 'ios' ||
		(Platform.OS === 'android' && Platform.Version < 23)) {
			return true;
		}

		const hasPermission = await PermissionsAndroid.check(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
		);

		if (hasPermission) return true;

		const status = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
		);

		if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

		if (status === PermissionsAndroid.RESULTS.DENIED) {
			ToastAndroid.show(i18n.t('MAPSCREEN_LocationDenied'), ToastAndroid.LONG);
		} else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
			ToastAndroid.show(i18n.t('MAPSCREEN_LocationRevoked'), ToastAndroid.LONG);
		}

		return false;
	}

	_getLocation = async () => {
		const hasLocationPermission = await this._hasLocationPermission();

		if (!hasLocationPermission) return;

		this.setState({ loadingLocation: true, locationDetected: false }, () => {
			Geolocation.getCurrentPosition(
			(position) => {
				this.setState({loadingLocation: false, locationDetected: true, latitude: position.coords.latitude, longitude: position.coords.longitude });
				console.log("position",position);
			},
			(error) => {
				this.setState({loadingLocation: false });
				if (error.code == 2) {
					alert(i18n.t('MAPSCREEN_EnableLocation'));
				} else {
					alert(i18n.t('MAPSCREEN_CouldNotDetectLocation'));
				}
				console.log(error);
			},
			{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, distanceFilter: 50, forceRequestLocation: true }
			);
		});
	}

	_mapViewConfig = () => {

		console.log("mapregion",this.props.mapregion);

		console.log("_mapViewConfig");
		const lat = this.state.latitude ? parseFloat(this.state.latitude) : parseFloat(this.props.mapregion[0]);
		const lng = this.state.longitude ? parseFloat(this.state.longitude) : parseFloat(this.props.mapregion[1]);
		const defaultRegion = {latitude:lat, longitude:lng,latitudeDelta: 0.02,longitudeDelta: 0.02};
		if (this.props.locationClicked || this.state.locationDetected) {
			return {region: defaultRegion}
		} else {
			return {initialRegion: defaultRegion}
		}
	};
	
    render () {
		const defaultRegion = {latitude:parseFloat(this.props.mapregion[0]), longitude:parseFloat(this.props.mapregion[1]),latitudeDelta: 0.02,longitudeDelta: 0.02};
        return (
			<View style={styles.container}>
			    <GooglePlacesAutocomplete
					ref={(instance) => { this.locationSearchInputRef = instance }}
					placeholder={i18n.t('MAPSCREEN_TypeYourAddress')}
					autoFocus={false}
					minLength={3} // minimum length of text to search
					returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
					listViewDisplayed={false}
					fetchDetails={true}
					onPress={this._addressOnClick}
					getDefaultValue={() => this.props.userLocationSet ? this.props.userLocation : ''}
					placeholderTextColor='#1e1e1e'
					
					query={{
						// available options: https://developers.google.com/places/web-service/autocomplete
						key: GOOGLEAPIKEY,
						language: 'en', // language of the results
						types: 'geocode', // default: 'geocode'
						location: this.props.searchcoords, // to be gotten from the locality option
						radius: '1000000',
						components: 'country:'+APPCOUNTRY,
						strictbounds: '',
					}}

					styles={{
						textInputContainer: {
							width: '100%',
							backgroundColor: 'transparent',
							borderTopColor: 'transparent',
							borderBottomColor: 'transparent',
							borderTopWidth: 0,
							borderBottomWidth: 0,
							alignItems: 'center',
							height: 56,
						},
						textInput: {
							borderRadius: 0,
							marginLeft: 0,
							backgroundColor: 'transparent',
							fontFamily: APPFONTMEDIUM,
							fontSize: 16,
							color: '#1e1e1e',
							height: 56,
							paddingTop: 0,
						},
						description: {
							fontSize: 14,
							fontFamily: APPFONTMEDIUM,
							color: '#1e1e1e',
						},
						container: {
							position: 'absolute',
							zIndex: 20,
							left:0,
							top: 0,
							width: '100%',
							paddingTop: getStatusBarHeight(),
							backgroundColor: '#eeeeee',
						},
						listView: {
							backgroundColor: '#eeeeee',
							color: '#1e1e1e',
							fontFamily: APPFONTMEDIUM,
						},
						separator: {
							backgroundColor: 'transparent',
						},
						poweredContainer: {
							backgroundColor: '#eeeeee',
						},
					}}

					currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
					currentLocationLabel={i18n.t('MAPSCREEN_CurrentLocation')}
					nearbyPlacesAPI='GoogleReverseGeocoding' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
					filterReverseGeocodingByTypes={['route', 'street_number', 'street_address', 'postal_code']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
					debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
					renderLeftButton={() => <Feather name='search' style={styles.searchInputIcon}/>}
					renderRightButton={() => <TouchableHighlight underlayColor='transparent' onPress={this._getLocation}><Feather style={styles.userLocationBtn} name="crosshair" /></TouchableHighlight>}
				/>
				<View style={styles.mapContainer}>
					<MapView
						{...this._mapViewConfig()}
						style={styles.map}
						onRegionChangeComplete={this._regionChanged}
					/>
					<View style={styles.marker}><SvgPlaceholder width={32} height={32}/></View>
				</View>
				<View style={styles.doneBtnWrapper}>
					<TouchableHighlight underlayColor='transparent' onPress={() => {this.props.navigation.goBack()}}>
						<Text style={styles.doneBtnText}><Feather name='check' style={styles.doneBtnIcon}/>  {i18n.t('MAPSCREEN_DoneLocationSelection')}</Text>
					</TouchableHighlight>
				</View>
				<IosStatusBar/>
				{this.state.loadingLocation ? (<Loading/>) : null}
			</View>
        );
    }
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		display: 'flex',
		alignItems: 'stretch',
		flexDirection: 'column',
	},
	searchInputIcon: {
		fontSize: 24,
		paddingLeft: 16,
		paddingRight: 8,
		paddingTop: 4,
		color: '#1e1e1e',
	},
	mapContainer: {
		height: '100%',
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
		marginTop:-34,
		marginLeft:-16,
	},
	mapIcon: {
		fontSize: 24,
		color: SECONDARYBUTTONSCOLOR,
	},
	doneBtnWrapper: {
		padding: 16,
		backgroundColor: '#fff',
	},
	doneBtnText: {
		borderRadius: 10,
		paddingLeft: 16,
		paddingRight: 16,
		height: 40,
		paddingTop: 12,
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
		overflow: 'hidden',
	},
	doneBtnIcon: {
		fontSize: 16,
		color: PRIMARYBUTTONTEXTCOLOR
	},
	userLocationBtn: {
		fontSize: 24,
		paddingLeft: 8,
		paddingRight: 16,
		paddingTop: 4,
		color: PRIMARYBUTTONCOLOR	
	},
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
		userLocalityCoords: state.userLocalityCoords,
		locationClicked: state.locationClicked,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		setUserLocation: (currentloc, loccoords, locationClicked) => dispatch({type: 'SETUSERLOCATION', loc: currentloc, coords: loccoords ,locclicked: locationClicked}),
		setUserLocationOnly: (currentloc, loccoords, locationClicked) => dispatch({type: 'SETUSERLOCATIONONLY', loc: currentloc, coords: loccoords ,locclicked: locationClicked})
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);