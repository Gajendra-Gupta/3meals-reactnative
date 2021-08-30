import React from 'react';
import { Platform, StyleSheet, StatusBar, View, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import AppNavigator from './navigation/AppNavigator';
import { Provider } from 'react-redux';
import { Norsani } from './Norsani';
import Store from './store/Store';
import IosStatusBar from './components/IosStatusBar';
import { GOOGLEAPIKEY, STATUSBARCOLOR, LOADINGSCREENCOLOR } from './config';
import AppLoader from './components/AppLoader';
import { isPointInPolygon } from 'geolib'
import i18n from './i18n/config';



export default class App extends React.PureComponent {
	state = {
		splashLoaded: false,
		appLoadComplete: false,
		loggedinwith: false

	}

	
	componentDidMount = () => {
		setTimeout(() => {
			this.setState({splashLoaded : true});
		}, 2500);
	}

	render() {	


		if (this.state.splashLoaded == false) {
			return (
				<View style={styles.container}>				

					<Image
						source={require('./assets/images/splash.gif')}
						style={{ width: '100%', height: '100%' }}
					/>
				</View>
			);
		}
		else if (!this.state.appLoadComplete && !this.state.loggedinwith) {
			this._loadResourcesAsync();
			return (
				<View style={styles.container}>
					<IosStatusBar />
					<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />					
				</View>
			);
		} if (this.state.loggedinwith == "false") {
			return (
				<Provider store={Store}>
					<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />
					<AppNavigator />
				</Provider>
			);
		}
		else if (!this.state.appLoadComplete) {
			//this._loadResourcesAsync();
			return (
				<View style={styles.container}>
					<IosStatusBar />
					<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />
					{this.state.loggedinwith ? (<AppLoader />) : null}					
				</View>
			);
		} else {
			return (
				<Provider store={Store}>
					<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />
					<AppNavigator />
				</Provider>

			);
		}
	}

	_loadResourcesAsync = async () => {
		let norsaniData = {};
		let requiredData = [];
		return Promise.all([

			await AsyncStorage.getItem('LOGGEDINWITH', (err, val) => {				
				if (val) {
					this.setState({ loggedinwith: true })					
					
				} else {
					this.setState({ loggedinwith: "false" })
				}
			}),
			/*Load Saved Data*/
			await AsyncStorage.multiGet(['USERLOCALITY', 'USERLOCALITYCOORDS', 'USERLOCATION', 'USERLOCATIONCOORDS', 'ORDERTYPE', 'VENDORTYPE', 'USERDATA', 'FAVVENDORS', 'FAVITEMS', 'LOGGEDINWITH'], (err, results) => {
				if (err == null && results != null) {
					results.map((result, i, stored) => {
						let key = stored[i][0];
						let val = stored[i][1];

						/*Check user locality*/
						if (key == 'USERLOCALITY') {
							if (val) {
								norsaniData.userlocality = val;
							} else {
								requiredData.push('userlocality');
							}
						}

						/*Check user locality Coords if user has saved his locality*/
						if (key == 'USERLOCALITYCOORDS') {
							if (val) {
								norsaniData.userlocalitycoords = val;
							}
						}

						/*Check user location*/
						if (key == 'USERLOCATION') {
							if (val) {
								norsaniData.userlocation = val;
							}
						}

						/*Check user location Coords*/
						if (key == 'USERLOCATIONCOORDS') {
							if (val) {
								norsaniData.userlocationcoords = val;
							}
						}

						/*Check user selected order type*/
						if (key == 'ORDERTYPE') {
							if (val) {
								norsaniData.ordertype = val;
							}
						}

						/*Check vendor type*/
						if (key == 'VENDORTYPE') {
							if (val) {
								norsaniData.vendortype = val;
							} else {
								requiredData.push('vendortype');
							}
						}

						/*Check user email*/
						if (key == 'USERDATA') {
							if (val) {
								norsaniData.userdata = JSON.parse(val);
							}
						}

						/*Check fav vendors*/
						if (key == 'FAVVENDORS') {
							if (val) {
								norsaniData.favvendors = JSON.parse(val);
							}
						}

						/*Check fav items*/
						if (key == 'FAVITEMS') {
							if (val) {
								norsaniData.favitems = JSON.parse(val);
							}
						}

						/*Check logged in with*/
						if (key == 'LOGGEDINWITH') {							
							if (val) {
								norsaniData.loggedinwith = val;
								//this.setState({ loggedinwith: true })
							} else {
								//this.setState({ loggedinwith: "false" })
							}

						}
					});
				}
			}),
			/*Load App*/
			await Norsani.get('loadapp', 'norsani', { reqdata: requiredData, avadata: JSON.stringify(norsaniData) }).then((data) => {
				//console.log("loadappReq", { reqdata: requiredData, avadata: JSON.stringify(norsaniData) });
				//console.log("loadapp", data);
				let readable_data = Object.assign(norsaniData, JSON.parse(data));
				let vendorTags = [];
				let deliveryVendors = [];
				let noResultsMsg = null;
				const orderType = readable_data.ordertype ? readable_data.ordertype : Object.keys(readable_data.ordertypes)[0];
				const userlocalitylatlngraw = orderType != 'delivery' && readable_data.userLocalityCoords ? readable_data.userLocalityCoords.split(',') : null;
				const userlatlngraw = /* orderType == 'delivery' &&  */readable_data.userlocationcoords ? readable_data.userlocationcoords.split(',') : null;
				const userlatlng = userlatlngraw ? { latitude: userlatlngraw[0], longitude: userlatlngraw[1] } : null;

				/*Similar functionality is also there in Home.js*/
				if (readable_data && Object.keys(readable_data.vendors).length > 0) {
					let vendors = [];
					Promise.all(Object.keys(readable_data.vendors).map(async (key, index) => {
						let polygon = [];
						const vendor_obj = readable_data.vendors[key];
						const vendor_delivery_zone = vendor_obj.delivery_zone;
						const vendor_geo_address = vendor_obj.address_geo.split(',');
						vendor_delivery_zone.map((elem) => elem[0] != '' && elem[1] != '' ? polygon.push({ latitude: elem[0], longitude: elem[1] }) : null);

						if (/* orderType == 'delivery' && */ userlatlngraw && isPointInPolygon(userlatlng, polygon)) {

							deliveryVendors.push(parseInt(key));

							/*Get the distance and duration*/
							await fetch('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + userlatlngraw[0] + ',' + userlatlngraw[1] + '&destinations=' + vendor_geo_address[0] + ',' + vendor_geo_address[1] + '&key=' + GOOGLEAPIKEY)
								.then((response) => response.json())
								.then((responseJson) => {
									if (responseJson.rows[0].elements.length > 0 && responseJson.rows[0].elements[0].distance) {
										readable_data.vendors[key].distance = responseJson.rows[0].elements[0].distance.value;
										readable_data.vendors[key].duration = responseJson.rows[0].elements[0].duration.value;
										readable_data.vendors[key].id = key;
										vendors.push(readable_data.vendors[key]);
									}
								})
								.catch((error) => {
									console.error(error);
									readable_data.vendors[key].id = key;
									vendors.push(readable_data.vendors[key]);
								});

							/*Get the tags*/
							vendor_obj.vendorclass.map(elem => { vendorTags.push(elem) });

						} else if (orderType != 'delivery' && userlocalitylatlngraw) {
							/*Get the distance and duration*/
							await fetch('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + userlocalitylatlngraw[0] + ',' + userlocalitylatlngraw[1] + '&destinations=' + vendor_geo_address[0] + ',' + vendor_geo_address[1] + '&key=' + GOOGLEAPIKEY)
								.then((response) => response.json())
								.then((responseJson) => {
									if (responseJson.rows[0].elements.length > 0 && responseJson.rows[0].elements[0].distance) {
										readable_data.vendors[key].distance = responseJson.rows[0].elements[0].distance.value;
										readable_data.vendors[key].id = key;
										vendors.push(readable_data.vendors[key]);
									}
								})
								.catch((error) => {
									console.error(error);
									readable_data.vendors[key].id = key;
									vendors.push(readable_data.vendors[key]);
								});
						} else if (orderType == 'delivery') {
							delete readable_data.vendors[key];
						}
						else {
							readable_data.vendors[key].id = key;
							vendors.push(readable_data.vendors[key]);
						}

					})
					).then(() => {
						vendors = vendors.slice().sort((a, b) => a.distance - b.distance);
						readable_data.vendors = vendors;
						
						//if (orderType == 'delivery') {
							const distinctVendorTags = [... new Set(vendorTags)];
							noResultsMsg = orderType == 'delivery' && deliveryVendors.length == 0 ? i18n.t('HOME_LocationNotFound') : noResultsMsg;

							Promise.all(readable_data.vendors_tags = readable_data.vendors_tags.filter((elem, index) => distinctVendorTags.includes(elem.name))
							).then(() => {
								Store.dispatch({ type: 'LOADAPP', data: readable_data, deliveryvendors: deliveryVendors, noresultsmsg: noResultsMsg });

								const storeTree = Store.getState();
								if (storeTree.appLoaded) {
									this.setState({ appLoadComplete: true });
								}
							})
						/* } else {
							Store.dispatch({ type: 'LOADAPP', data: readable_data, deliveryvendors: deliveryVendors, noresultsmsg: noResultsMsg });
							const storeTree = Store.getState();
							if (storeTree.appLoaded) {
								this.setState({ appLoadComplete: true });
							}
						} */

					});
				} else {
					noResultsMsg = i18n.t('HOME_NoVendorsFound');

					Store.dispatch({ type: 'LOADAPP', data: readable_data, deliveryvendors: deliveryVendors, noresultsmsg: noResultsMsg });

					const storeTree = Store.getState();
					if (storeTree.appLoaded) {
						this.setState({ appLoadComplete: true });
					}
				}
			}).catch(error => console.log(error))
		]);
	};

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: LOADINGSCREENCOLOR,
	},
});