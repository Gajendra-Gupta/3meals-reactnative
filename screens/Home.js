import React from 'react';
import { connect } from 'react-redux';
import { Animated, Text, Image, ScrollView, Dimensions, StatusBar, Platform, StyleSheet, Button, Alert, View, TouchableOpacity, PanResponder } from 'react-native';
import { Norsani } from '../Norsani';
import { APPFONTMEDIUM, APPFONTREGULAR, GOOGLEAPIKEY, STATUSBARCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, HOMEHEADINGCOLOR, HOMEHEADINGTEXTCOLOR, STRIPE_KEY, API_URL, SEARCHRESULTSSORTINGOPTIONS, SEARCHRESULTSSORTINGOPTIONSICON, MODALBODYCOLOR, WEBSITEURL, APPFONTBOLD } from '../config';
import { Coupons } from '../components/home/Coupons';
import { RecommendedVendors } from '../components/home/RecommendedVendors';
import { VendorsTags } from '../components/home/VendorsTags';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { VendorsList } from '../components/home/VendorsList';
import { SpecialProducts } from '../components/home/SpecialProducts';
import { isPointInPolygon } from 'geolib'
import FeaturedVendors from '../components/home/FeaturedVendors';
import OrderThankYou from '../components/OrderThankYou';
import GeneralFilters from '../components/GeneralFilters';
import Feather from 'react-native-vector-icons/Feather';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import SvgCompass from '../assets/images/Compass';
import IosStatusBar from '../components/IosStatusBar';
import i18n from '../i18n/config';
import ContentLoader from '../components/ContentLoader';
import stripe from 'react-native-stripe-payments';
import { WebView } from 'react-native-webview';
import { Modal } from 'react-native';
import { TouchableHighlight } from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import SplashScreen from 'react-native-splash-screen'
import AsyncStorage from '@react-native-community/async-storage';



let noResultsMsg;

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');



class Home extends React.Component {
	scroll = new Animated.Value(0);

	state = {
		headerY: Animated.multiply(Animated.diffClamp(this.scroll, 0, (Platform.OS == 'android' ? 20 : 0 ) + getStatusBarHeight()), -1),
		//headerY: Animated.multiply(Animated.diffClamp(this.scroll, 0, 45), -1),
		headerElevation: 0,
		showSelectedVendorType: false,
		showDarkBg: new Animated.Value(0),
		animatePickerWrapper: new Animated.Value(viewportWidth),
		showOptionsModal: false,
		modalType: "",
		sortResultsBy: Object.keys(SEARCHRESULTSSORTINGOPTIONS)[0],
		preOrder: false,
		optionsVisible: false,
		loadingAppData: false,
		Posts: [],
		activeSlide: 0,
	}

	componentDidMount = () => {
		if (this.props.updateData) {
			this._loadApp();
		}
		this.loadPosts();
		//SplashScreen.hide();

		this.checkCartData();
	}

	async checkCartData() {
		await AsyncStorage.multiGet(['cartTotals', 'cartItemsData', 'coupons', 'crossSells'], (err, results) => {
			//await AsyncStorage.getItem('USERDATA', (err, val) => {
			if (err == null && results != null) {

				console.log("results", results);

				let totals;
				let cart_data;
				let crossSells;
				let validCoupons;

				results.map((result, i, stored) => {
					let key = stored[i][0];
					let val = stored[i][1];

					if (key == "cartTotals") {
						val = JSON.parse(val);
						totals = val;

					}
					if (key == "cartItemsData") {
						val = JSON.parse(val);
						cart_data = val;

					}
					if (key == "coupons") {
						val = JSON.parse(val);
						validCoupons = val;

					}
					if (key == "crossSells") {
						val = JSON.parse(val);
						crossSells = val;

					}

					this.props.saveCart(totals, cart_data, crossSells, validCoupons);

				});
			}

		});
	}


	componentDidUpdate = (prevProps, prevState) => {
		//console.log("componentDidUpdate",prevState);
		if (this.props.updateData && this.state.loadingAppData == false) {
			//this.loadPosts();
			this._loadApp();
		}
		if (this.props.navigation.getParam('openViewOptions') == true && !this.state.showOptionsModal) {
			this.setState({ showOptionsModal: true, modalType: 'order_type' }, () => { this.props.navigation.setParams({ openViewOptions: false }) });
		}
	}

	_scrollListener = (e) => {
		const scrollPosition = e.nativeEvent.contentOffset.y;
		if (scrollPosition > 56 && this.state.headerElevation == 0) {
			this.setState({ headerElevation: 5, showSelectedVendorType: true });
		} else if (scrollPosition < 56 && this.state.headerElevation > 0) {
			this.setState({ headerElevation: 0, showSelectedVendorType: false });
		}
	}


	_openOptionsModal = (type) => {
		this.setState({ showOptionsModal: true, modalType: type });
		//this.payWithCard();
	}

	async payWithCard() {

		const cardDetails = {
			number: '4242424242424242',
			expMonth: 10,
			expYear: 21,
			cvc: '888',
		};

		console.log("_stripeInitialized", stripe._stripeInitialized);

		stripe.setOptions({ publishingKey: STRIPE_KEY });

		if (stripe._stripeInitialized == false)
			return;


		const isCardValid = stripe.isCardValid(cardDetails);

		console.log("isCardValid", isCardValid);

		let req = {
			name: "Gajendra",
			address: "131 veda",
			postal_code: "452014",
			city: "Berlin",
			state: "Berlin",
			country: "DE",
			amount: 100
		}




		let response = await fetch(API_URL + "get_client_secret.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(req)
		});

		console.log("response", response);

		let json = await response.json();
		console.log("json", json);
		json = JSON.parse(json);
		console.log("client_secret", json.client_secret);

		stripe.confirmPayment(json.client_secret, cardDetails)
			.then(result => {
				// result of type PaymentResult
				console.log("confirmPayment success", result);
			})
			.catch(err => {
				// error performing payment
				console.log("confirmPayment failed", err);
			})

	}


	_closeOptionsModal = () => {
		this.setState({ showOptionsModal: false });
	}

	_pageHeader = () => {
		const headerShadow = this.state.headerElevation > 0 ? { ...Platform.select({ ios: { shadowColor: 'black', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84 }, android: { elevation: 5 } }) } : null;
		const orderType = this.props.orderType;

		//console.log("orderType", this.props.orderType);
		//console.log("props", this.props);

		return (
			<Animated.View style={[styles.headerWrapper, headerShadow, {
				transform: [{
					translateY: this.state.headerY
				}]
			}]}>
				<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />
				{/* {this.state.showSelectedVendorType ? (
					<View style={styles.headerLeft}>
						<Text style={styles.headerWrapperTitle}>{this.props.selectedVendorType}</Text>
					</View>
				) : null} */}


				<View style={styles.orderTypeWrapper}>

					<Text onPress={() => { this.props.setOrdersType('delivery'); this.setState({ preOrder: true }) }} style={[orderType == 'delivery' && this.state.preOrder == true ? styles.buttonSelected : styles.button]}>{i18n.t('ORDERTYPE_PreOrder')}</Text>

					<Text onPress={() => { this.props.setOrdersType('delivery'); this.setState({ preOrder: false }) }} style={[orderType == 'delivery' && this.state.preOrder == false ? styles.buttonSelected : styles.button]}>{i18n.t('ORDERTYPE_DELIVERY')}</Text>

					<Text onPress={() => { this.props.setOrdersType('pickup'); this.setState({ preOrder: false }) }} style={[orderType == 'pickup' && this.state.preOrder == false ? styles.buttonSelected : styles.button]}>{i18n.t('ORDERTYPE_PICKUP')}</Text>

					{/* <TouchableOpacity onPress={() => { this.props.setOrdersType('delivery'); this.setState({ preOrder: true }) }}>
						<Text onPress={() => { this.props.setOrdersType('delivery'); this.setState({ preOrder: true }) }} style={[orderType == 'delivery' && this.state.preOrder == true ? styles.buttonSelected : styles.button]}>{i18n.t('ORDERTYPE_PreOrder')}</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => { this.props.setOrdersType('delivery'); this.setState({ preOrder: false }) }}>
						<Text style={[orderType == 'delivery' && this.state.preOrder == false ? styles.buttonSelected : styles.button]}>{i18n.t('ORDERTYPE_DELIVERY')}</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => { this.props.setOrdersType('pickup'); this.setState({ preOrder: false }) }}>
						<Text style={[orderType == "pickup" ? styles.buttonSelected : styles.button]}>{i18n.t('ORDERTYPE_PICKUP')}</Text>
					</TouchableOpacity> */}
				</View>

				<View style={{ flexDirection: 'row', paddingBottom: 10, width: '100%', justifyContent: 'center' }}>
					{/* <View style={styles.searchBox} >
						<Feather name='map-pin' style={styles.optionTitleIcons} />
						<Text numberOfLines={1} onPress={() => { orderType == 'delivery' ? this.props.navigation.navigate('MapModal') : this._openOptionsModal('address') }} style={styles.addresText}>{orderType == "pickup" ? this.props.userLocality : this.props.userloc}</Text>
					</View> */}

					<TouchableOpacity onPress={() => { this.props.navigation.navigate('MapModal') }}>
						<View style={styles.searchBox} >
							<Feather name='map-pin' style={styles.optionTitleIcons} />
							<Text numberOfLines={1} style={styles.addresText}>{this.props.userloc}</Text>
						</View>
					</TouchableOpacity>

					<View style={styles.headerRight}>
						<TouchableOpacity onPress={() => { this.setState({ optionsVisible: !this.state.optionsVisible }) }}>
							<Feather name='filter' style={[styles.headerIcon]} />
						</TouchableOpacity>
					</View>

				</View>


			</Animated.View >
		)
	}

	_renderTitle = () => {

		return (
			<View style={styles.headerTitleWrapper}>
				{/* <Text style={styles.headerTitle} numberOfLines={3}>{this.props.appTitle}</Text> */}
				{/* <Text style={styles.headerTitle} numberOfLines={3}>{i18n.t('appTitle')}</Text> */}
				<Image resizeMode='contain' style={{ height: 60, width: '100%' }} source={require('../assets/images/3meals_logo.jpg')} />
			</View>
		);
	}

	_renderFilters() {
		return (
			<Modal
				animationType="slide"
				transparent={true}
				visible={this.state.optionsVisible}
				onRequestClose={() => {
					this.setState({ optionsVisible: !this.state.optionsVisible })
				}}
			>
				<View style={styles.modalBodyWrapper}>
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.setState({ optionsVisible: !this.state.optionsVisible }) }}>
						<View style={{ height: viewportHeight - 350 }} />
					</TouchableHighlight>
					<View style={styles.modalBody}>
						<Text style={styles.modalTitle}>{i18n.t('SEARCH_FilterResults')}</Text>

						{Object.keys(SEARCHRESULTSSORTINGOPTIONS).map((elem, index) =>

							<TouchableHighlight style={styles.optionTitleWrapper} underlayColor='transparent' onPress={() => { this.setState({ optionsVisible: !this.state.optionsVisible }); this.setState({ sortResultsBy: elem }) }}>
								<View style={styles.optionTitleWrapper}>
									<Text style={styles.optionIconWrapper}><Feather name={SEARCHRESULTSSORTINGOPTIONSICON[elem]} style={styles.optionsIcon} /></Text>
									<Text key={index} style={styles.optionTitle}>{i18n.t(SEARCHRESULTSSORTINGOPTIONS[elem])}</Text>
									{this.state.sortResultsBy == elem ? (<Text><Feather name='check' style={styles.optionsIconSelected} /></Text>) : null}
								</View>
							</TouchableHighlight>
						)}
					</View>
				</View>

			</Modal>
		);
	}



	async loadPosts() {

		let response = await fetch(WEBSITEURL + "/wp-json/wp/v2/posts");
		let json = await response.json();

		if (json && json.length > 0) {

			let posts = []

			json.forEach(element => {
				posts.push({
					title: element.title.rendered,
					content: element.content.rendered,
					image: element.better_featured_image.source_url,
					imageWidth: element.better_featured_image.media_details.width,
					imageHeight: element.better_featured_image.media_details.height,
					vendorId: element.acf.post_vendor,
				});
			});

			this.setState({ Posts: posts });
		}
	}

	_renderItem = ({ item, index }) => {
		return (
			<TouchableOpacity onPress={() => {
				item.vendorId ? this.props.navigation.navigate('Vendor', { vendorid: item.vendorId }) :
					this.props.navigation.navigate('ViewPost', { post: item })
			}} >
				<View>
					<Image source={{ uri: item.image }} style={styles.image} />
					<View style={styles.imageContainer}>
						<Text style={styles.title} numberOfLines={1}>{item.title}</Text>
						<WebView
							useWebKit = {true}
							style={{ height: 45, maxHeight: 45, backgroundColor: 'transparent', overflow: 'hidden' }}
							originWhitelist={['*']}
							source={{ html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="overflow:hidden;color:white;font: 16px ' + APPFONTMEDIUM +'; ">' + item.content + '</body></html>' }}
						/>
						{/* <Text style={styles.subTitle}>{item.content}</Text> */}
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	get pagination() {
		const { Posts, activeSlide } = this.state;
		return (
			<Pagination
				dotsLength={Posts.length}
				activeDotIndex={activeSlide}
				containerStyle={{}}
				dotStyle={{
					width: 10,
					height: 10,
					borderRadius: 5,
					marginHorizontal: 0,
					backgroundColor: 'rgba(0, 0, 0, 0.92)'
				}}
				inactiveDotStyle={{
					// Define styles for inactive dots here
				}}
				inactiveDotOpacity={0.4}
				inactiveDotScale={0.6}
			/>
		);
	}

	_renderPosts() {

		const { Posts } = this.state;

		return (
			<View>
				<Carousel
					//ref={(c) => { this._carousel = c; }}
					data={Posts}
					renderItem={this._renderItem}
					sliderWidth={viewportWidth}
					itemWidth={viewportWidth - 60}
					onSnapToItem={(index) => this.setState({ activeSlide: index })}
				/>
				{this.pagination}
			</View>
		);
	}


	_loadApp = async () => {
		const orderType = this.props.orderType;

		//noResultsMsg = i18n.t('HOME_NoVendorsFound');

		if (orderType == 'delivery' && !this.props.userLocationSet) {
			return false;
		}

		this.setState({ loadingAppData: true });


		const userlocalitylatlngraw = /* orderType != 'delivery' && */ this.props.userLocalityCoords ? this.props.userLocalityCoords.split(',') : null;
		const userlatlngraw = /* orderType == 'delivery' && */ this.props.userLocationCoords ? this.props.userLocationCoords.split(',') : null;
		const userlatlng = userlatlngraw ? { latitude: userlatlngraw[0], longitude: userlatlngraw[1] } : null;
		//console.log("userlatlng",userlatlng);
		const currentVendorsType = this.props.selectedVendorType;
		const currentUser = this.props.currentUser;
		const userLocality = ''; //orderType != 'delivery' ? this.props.userLocality : '';
		let vendorTags = [];
		let deliveryVendors = [];
		//console.log("Vendor Req Data",{vendortype: currentVendorsType, ordertype: orderType, customer: Object.keys(currentUser).length > 0 ? currentUser.user.email : null, locality: userLocality })

		/*Call delivery data*/
		Norsani.get('loadappdata', 'norsani', { vendortype: currentVendorsType, ordertype: orderType, customer: Object.keys(currentUser).length > 0 ? currentUser.user.email : null, locality: userLocality }).then((data) => {
			//console.log("loadappdata", data);
			let readable_data = JSON.parse(data);
			if (readable_data && Object.keys(readable_data.vendors).length > 0) {
				let vendors = [];
				noResultsMsg = orderType == 'delivery' ? i18n.t('HOME_LocationNotFound') : noResultsMsg;
				Promise.all(Object.keys(readable_data.vendors).map(async (key, index) => {

					let polygon = [];

					const vendor_obj = readable_data.vendors[key];
					const vendor_delivery_zone = vendor_obj.delivery_zone;
					const vendor_geo_address = vendor_obj.address_geo.split(',');
					vendor_delivery_zone.map((elem) => elem[0] != '' && elem[1] != '' ? polygon.push({ latitude: elem[0], longitude: elem[1] }) : null);

					if (/* orderType == 'delivery' && */userlatlngraw && isPointInPolygon(userlatlng, polygon)) {


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

						//console.log("distance",'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + userlocalitylatlngraw[0] + ',' + userlocalitylatlngraw[1] + '&destinations=' + vendor_geo_address[0] + ',' + vendor_geo_address[1] + '&key=' + GOOGLEAPIKEY);
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
					} /* else {
					readable_data.vendors[key].id = key;
						vendors.push(readable_data.vendors[key]);
					} */

				})
				).then(() => {
					vendors = vendors.slice().sort((a, b) => a.distance - b.distance);
					readable_data.vendors = vendors;
					//if (orderType == 'delivery') {
					const distinctVendorTags = [... new Set(vendorTags)];

					Promise.all(readable_data.vendors_tags = readable_data.vendors_tags.filter((elem, index) => distinctVendorTags.includes(elem.name))
					).then(() => { this.props.updateAppData(readable_data, deliveryVendors) })
					/* } else {
						this.props.updateAppData(readable_data, deliveryVendors);
					} */
					this.setState({ loadingAppData: false });

				});
			} else {
				this.setState({ loadingAppData: false });
				this.props.updateAppData(readable_data, deliveryVendors);
			}
		}).catch(error => error.message ? Alert.alert(null, i18n.t('ConnectError')) : console.log(error));
	}

	render() {
		const appLoaded = this.props.appData;
		const currentVendorsType = this.props.selectedVendorType;
		const orderType = this.props.orderType;
		const nothingFoundMsg = noResultsMsg ? noResultsMsg : this.props.noResultsMsg;

		console.log("nothingFoundMsg",nothingFoundMsg);
		



		/* if (!this.props.loggedInWith) {
			this.props.navigation.navigate('Login', { from: 'home' })
		} */

		if (this.props.navigation.getParam('openOrderCompleteModal') == true || this.state.showOptionsModal || this.state.optionsVisible) {
			Animated.timing(this.state.showDarkBg, { toValue: .6, duration: 500, useNativeDriver: true, }).start();
		}

		if (orderType == 'delivery' && !this.props.userLocationSet) {
			return (
				<View style={styles.container}>
					{this._pageHeader()}
					<View style={[styles.innerContainer]}>
						<ScrollView
							contentContainerStyle={styles.mainScrollView}
							style={styles.mainScrollView}
						>

							{this._renderTitle()}
							{this._renderFilters()}
							<SvgCompass style={styles.noLocationIcon} width={80} height={80} />
							<Text style={styles.noResultsText}>{i18n.t('HOME_AddLocationFirst')}</Text>
							<TouchableOpacity onPress={() => { this.props.navigation.navigate('MapModal') }} >
								<Text style={styles.addLocationBtn}><Feather style={styles.addLocationIcon} name='map-pin' />  {i18n.t('HOME_AddLocation')}</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
					<OrderThankYou navigation={this.props.navigation} customerData={this.props.navigation.getParam('customerData')} vendorData={this.props.navigation.getParam('vendorData')} show={this.props.navigation.getParam('openOrderCompleteModal') == true} />
					{this.state.showOptionsModal || this.state.optionsVisible ? (
						<Animated.View style={{
							backgroundColor: '#000',
							opacity: this.state.showDarkBg,
							position: 'absolute',
							left: -2,
							top: -2,
							zIndex: 50,
							height: '105%',
							width: '105%',
						}} collapsable={false} />
					) : null}
					<GeneralFilters show={this.state.showOptionsModal} type={this.state.modalType} navigation={this.props.navigation} hide={this._closeOptionsModal} />
					<IosStatusBar />
				</View>
			);
		}


		if (appLoaded.vendors && Object.keys(appLoaded.vendors).length > 0 && !this.props.updateData) {
			return (
				<View style={[styles.container, {
					backgroundColor: '#fff',
				}]}>
					{this._pageHeader()}
					<Animated.ScrollView
						ref={(c) => { this.scrollView = c }}
						scrollEventThrottle={1}
						bounces={false}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.mainScrollView}
						style={styles.mainScrollView}
						onScroll={Animated.event(
							[{ nativeEvent: { contentOffset: { y: this.scroll } } }],
							{ useNativeDriver: true, listener: this._scrollListener },
						)}
						overScrollMode="never"
					>

						{this._renderTitle()}
						{this._renderFilters()}
						<View style={styles.topSpace} collapsable={false} />
						{this._renderPosts()}
						<Coupons navigation={this.props.navigation} appData={appLoaded} />
						<RecommendedVendors navigation={this.props.navigation} appData={appLoaded} />
						{/* <FeaturedVendors navigation={this.props.navigation} sortResultsBy={this.state.sortResultsBy} /> */}
						<FeaturedProducts navigation={this.props.navigation} appData={appLoaded} />

						<VendorsTags navigation={this.props.navigation} tagsData={appLoaded.vendors_tags} />
						<SpecialProducts navigation={this.props.navigation} appData={appLoaded} />
						<VendorsList navigation={this.props.navigation} appData={appLoaded} sortResultsBy={this.state.sortResultsBy} activeVendorType={currentVendorsType} />
					</Animated.ScrollView>

					<OrderThankYou navigation={this.props.navigation} customerData={this.props.navigation.getParam('customerData')} vendorData={this.props.navigation.getParam('vendorData')} show={this.props.navigation.getParam('openOrderCompleteModal') == true} />
					{this.props.navigation.getParam('openOrderCompleteModal') == true || this.state.showOptionsModal || this.state.optionsVisible ? (
						<Animated.View style={{
							backgroundColor: '#000',
							opacity: this.state.showDarkBg,
							position: 'absolute',
							left: -2,
							top: -2,
							zIndex: 50,
							height: '105%',
							width: '105%',
						}} collapsable={false} />
					) : null}
					<GeneralFilters show={this.state.showOptionsModal} type={this.state.modalType} navigation={this.props.navigation} hide={this._closeOptionsModal} />
					<IosStatusBar />
				</View>
			);
		} else {
			if (nothingFoundMsg && !this.props.updateData) {
				return (
					<View style={styles.container}>
						{this._pageHeader()}
						<View style={styles.innerContainer}>
							<ScrollView
								contentContainerStyle={styles.mainScrollView} style={styles.mainScrollView}
							>

								{this._renderTitle()}
								{this._renderFilters()}
								<Text style={styles.noResultsIconWrapper}><Feather name='info' style={styles.noResultsIcon} /></Text>
								<Text style={styles.noResultsText}>{nothingFoundMsg}</Text>
							</ScrollView>
						</View>
						<OrderThankYou navigation={this.props.navigation} customerData={this.props.navigation.getParam('customerData')} vendorData={this.props.navigation.getParam('vendorData')} show={this.props.navigation.getParam('openOrderCompleteModal') == true} />
						{this.state.showOptionsModal || this.state.optionsVisible ? (
							<Animated.View style={{
								backgroundColor: '#000',
								opacity: this.state.showDarkBg,
								position: 'absolute',
								left: -2,
								top: -2,
								zIndex: 50,
								height: '105%',
								width: '105%',
							}} collapsable={false} />
						) : null}
						<GeneralFilters show={this.state.showOptionsModal} type={this.state.modalType} navigation={this.props.navigation} hide={this._closeOptionsModal} />
						<IosStatusBar />
					</View>
				);
			} else {
				return (
					<View style={[styles.container, {
						backgroundColor: '#fff',
					}]}>
						{this._pageHeader()}
						<View style={styles.innerContainer}>
							<ScrollView
								contentContainerStyle={styles.mainScrollView}
								style={styles.mainScrollView}
							>
								{this._renderTitle()}
								{this._renderFilters()}
								<View style={styles.topSpace} collapsable={false} />
								<ContentLoader />
							</ScrollView>
						</View>
						<OrderThankYou navigation={this.props.navigation} customerData={this.props.navigation.getParam('customerData')} vendorData={this.props.navigation.getParam('vendorData')} show={this.props.navigation.getParam('openOrderCompleteModal') == true} />
						{this.state.showOptionsModal || this.state.optionsVisible ? (
							<Animated.View style={{
								backgroundColor: '#000',
								opacity: this.state.showDarkBg,
								position: 'absolute',
								left: -2,
								top: -2,
								zIndex: 50,
								height: '105%',
								width: '105%',
							}} collapsable={false} />
						) : null}
						<GeneralFilters show={this.state.showOptionsModal} type={this.state.modalType} navigation={this.props.navigation} hide={this._closeOptionsModal} />
						<IosStatusBar />
					</View>
				);
			}
		}
	}
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
		backgroundColor: '#eeeeee',
	},
	innerContainer: {
		flex: 1

	},
	button: {
		textAlign: 'center',
		padding: 5,
		color: '#000',
		borderRadius: 10,
		overflow: 'hidden',
		fontWeight: '400',
		fontSize: 14,
		flex: 1,
	},
	buttonSelected: {
		backgroundColor: STATUSBARCOLOR,
		textAlign: 'center',
		padding: 5,
		color: '#000',
		borderRadius: 14,
		overflow: 'hidden',
		fontWeight: '700',
		fontSize: 14,
		flex: 1,
	},
	orderTypeWrapper: {
		flexDirection: 'row',
		margin: 10,
		marginTop: 25,
		width: '100%',
		justifyContent: 'center',
		borderColor: STATUSBARCOLOR,
		borderWidth: 1,
		borderRadius: 20,
		backgroundColor: 'white'

	},
	searchBox: {
		backgroundColor: '#d6d6d6',
		width: viewportWidth - 70,
		padding: 10,
		borderRadius: 30,
		flexDirection: 'row',
		alignItems: 'center',
		overflow: 'hidden'
	},
	addresText: {
		fontSize: 14,
		color: '#000000',
		marginLeft: 10,
		marginRight: 10,
	},
	optionTitleIcons: {
		fontSize: 18,
		color: '#000000',
	},
	noResultsIconWrapper: {
		textAlign: 'center',
		paddingTop: 36,
	},
	noResultsIcon: {
		fontSize: 56,
		color: '#1e1e1e',
	},
	noLocationIcon: {
		alignSelf: 'center',
		marginTop: 32,
	},
	noResultsText: {
		fontFamily: APPFONTMEDIUM,
		fontSize: 24,
		color: '#1e1e1e',
		padding: 16,
		textAlign: 'center',
	},
	addLocationBtn: {
		borderRadius: 7,
		paddingLeft: 16,
		paddingRight: 16,
		height: 36,
		paddingTop: 8,
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		textAlign: 'center',
		alignSelf: 'center',
		overflow: 'hidden',
	},
	mainScrollView: {
		paddingTop: 78,// + getStatusBarHeight(true)
	},
	loadingContainer: {
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 100,
	},
	topSpace: {
		/* position: 'absolute',
		//height: 132,
		width: '100%',
		top: 170 + getStatusBarHeight(true),
		backgroundColor: '#eeeeee',
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
		overflow: 'hidden', */
	},
	headerWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		//height: 56 + getStatusBarHeight(true),
		backgroundColor: '#eeeeee',
		paddingTop: 32,// + getStatusBarHeight(true),
		paddingLeft: 16,
		paddingRight: 16,
		width: "100%",
		position: "absolute",
		zIndex: 10,
	},
	headerLeft: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	headerWrapperTitle: {
		fontSize: 20,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
	},
	headerIconStart: {
		marginRight: 32,
	},
	headerIconLeft: {
		marginRight: 24,
	},
	headerIcon: {
		fontSize: 24,
		color: '#000',
	},
	headerIconRight: {
		color: STATUSBARCOLOR,
	},
	headerRight: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row-reverse',
		alignItems: 'center',
	},
	headerTitleWrapper: {
		backgroundColor: 'white',
		width: '100%',
	},
	headerTitle: {
		fontSize: 32,
		fontFamily: 'Rubik-Bold',
		marginLeft: 16,
		marginRight: 16,
		//height: 126,
		color: HOMEHEADINGTEXTCOLOR,
	},
	modalBodyWrapper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingBottom: 50,
		zIndex: 9999
	},
	separator: {
		height: '65%'
	},
	modalBody: {
		flex: 1,
		position: 'relative',
		backgroundColor: MODALBODYCOLOR,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
		zIndex: 9999
	},
	modalTitle: {
		fontSize: 16,
		paddingTop: 20,
		paddingLeft: 16,
		paddingRight: 16,
		height: 56,
		fontFamily: APPFONTMEDIUM,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		color: '#1e1e1e',
	},
	optionWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		marginTop: 0,
	},
	optionTitleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	optionTitle: {
		fontSize: 18,
		padding: 15,
		fontFamily: APPFONTREGULAR,
		textAlign: 'left',
	},
	optionIconWrapper: {
		marginLeft: 16,
	},
	optionsIconSelected: {
		fontSize: 28,
		fontFamily: APPFONTBOLD,
		color: STATUSBARCOLOR,
	},
	optionsIcon: {
		fontSize: 16,
		color: '#1e1e1e',
	},
	optionPicker: {
		height: 36,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		flex: 1,
		marginRight: 16,
	},
	imageContainer: {
		flex: 1,
		position: 'absolute',
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.1)',
		width: '100%',
		padding: 10,
		borderBottomLeftRadius: 15,
		borderBottomRightRadius: 15,
	},
	title: {
		color: '#fff',
		fontFamily: APPFONTMEDIUM,
		fontSize: 18,
	},
	subTitle: {
		color: '#fff',
		fontFamily: APPFONTREGULAR,
		fontSize: 14,
	},
	image: {
		//...StyleSheet.absoluteFillObject,
		resizeMode: 'cover',
		height: 200,
		width: '100%',
		borderRadius: 15,
	}
});

const mapStateToProps = state => {
	return {
		appTitle: state.appTitle,
		selectedVendorType: state.selectedVendorType,
		localityOptions: state.localityOptions,
		currentUser: state.currentUser,
		appData: state.appData,
		userLocationSet: state.userLocationSet,
		userLocationCoords: state.userLocationCoords,
		userLocalityCoords: state.userLocalityCoords,
		orderType: state.orderType,
		userloc: state.userLocation,
		userLocality: state.userLocality,
		updateData: state.updateData,
		noResultsMsg: state.noResultsMsg,
		loggedInWith: state.loggedInWith,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		updateAppData: (data, delivery_vendors) => dispatch({ type: 'UPDATEAPPDATA', appdata: data, deliveryvendors: delivery_vendors }),
		setOrdersType: (ordertype) => dispatch({ type: 'SETORDERSTYPE', data: ordertype }),
		saveCart: (totals, cart_data, cross_sells, coupons_data) => dispatch({ type: 'SAVECART', total: totals, cartitemsdata: cart_data, crosssells: cross_sells, coupons: coupons_data })
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);