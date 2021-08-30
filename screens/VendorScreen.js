import React from 'react';
import { Animated, Text, View, Platform, SectionList, StatusBar, StyleSheet, Dimensions, Alert, Image, Linking, TouchableHighlight } from 'react-native';
import { Norsani } from '../Norsani';
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import ListItemProduct from '../components/ListItemProduct';
import VendorReviews from '../components/VendorReviews';
import Feather from 'react-native-vector-icons/Feather';
import { Loading } from '../components/Loading';
import CartBar from '../components/CartBar';
import AlarmIcon from '../assets/images/Alarm';
import NotesIcon from '../assets/images/Notes';
import DeliveryIcon from '../assets/images/Delivery';
import DistanceIcon from '../assets/images/Distance';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import LinearGradient from 'react-native-linear-gradient';
import i18n, { rtl } from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, MODALBODYCOLOR, SECONDARYBUTTONSCOLOR, SECONDARYBUTTONSTEXTCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, APPCURRENCY_FORMAT } from '../config';

const { width: viewportWidth } = Dimensions.get('window');

function wp(percentage) {
	const value = (percentage * viewportWidth) / 100;
	return Math.round(value);
}

const menuItemWidth = wp(80);
const menuSliderWidth = viewportWidth;

const headerHeight = 56 + getStatusBarHeight();
const coverHeight = 200;
const opacityStart = coverHeight - headerHeight - .001;
const opacityEnd = opacityStart + .001;

class VendorScreen extends React.Component {

	state = {
		vendorLoaded: {},
		itemsToLoad: {},
		activeMenu: null,
		slideImg: new Animated.Value(0),
		headerElevation: 0,
		headerIconsColor: '#fff',
		animateIcons: new Animated.Value(1),
		iconAnimated: true,
		isFavVendor: this.props.favVendors.includes(parseInt(this.props.navigation.getParam('vendorid'))),
		showDarkBg: new Animated.Value(0),
	};

	_scrollListener = (e) => {
		const scrollPosition = e.nativeEvent.contentOffset.y;
		if (scrollPosition > 100 && this.state.headerElevation == 0) {
			this.setState({ headerElevation: 5, headerIconsColor: '#000' });
		} else if (scrollPosition < 100 && this.state.headerElevation > 0) {
			this.setState({ headerElevation: 0, headerIconsColor: '#fff' });
		}
	}

	componentDidMount = () => {
		if (Object.keys(this.state.vendorLoaded).length == 0) {
			this._loadVendor();
		}
	};

	componentDidUpdate = (prevProps, prevState) => {
		if (prevState.isFavVendor != this.state.isFavVendor && !this.state.iconAnimated) {
			Animated.sequence([
				Animated.timing(this.state.animateIcons, {
					toValue: 1.2,
					duration: 150,
					useNativeDriver: true,
				}),
				Animated.timing(this.state.animateIcons, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true
				}),
			]).start();
			this.setState({ iconAnimated: true });
		}
	}

	_rendersection = () => {
		const vendor = this.state.vendorLoaded;
		const activemenu = this.state.activeMenu;

		let finalarray = [];
		for (const [key, val] of Object.entries(vendor.productcats)) {
			let itemsdata = [];
			const catCount = this.state.itemsToLoad[key] ? this.state.itemsToLoad[key] : 5;

			for (let i = 0; val.length > i; i++) {
				const singleItem = vendor.products.find(elem => {
					if (activemenu) {
						return elem.id == val[i] && elem.menus.includes(activemenu);
					} else {
						return elem.id == val[i];
					}
				});
				if (singleItem) {
					singleItem.productCatIcon = vendor.productcatsImg[key];
					itemsdata.push(singleItem);
				}
			}
			const pagedItems = itemsdata.slice(0, catCount);

			if (itemsdata.length > catCount) {
				pagedItems.push({ loadmore: key });
			}

			if (pagedItems.length > 0) {
				finalarray.push({ title: key, data: pagedItems });
			}
		}

		return finalarray;
	};

	_loadMore = (cat) => {
		let countData = this.state.itemsToLoad;
		const catCount = countData[cat] ? countData[cat] : 5;
		countData[cat] = catCount + 5;

		this.setState({ itemsToLoad: countData });
	};

	async _loadVendor() {
		const vendor_id = this.props.navigation.getParam('vendorid');

		//console.log("vendor_id", vendor_id);

		Norsani.get('vendor/' + vendor_id, 'norsani').then((data) => {
			if (data) {
				//console.log("data",data);
				const returned_data = JSON.parse(data);

				this.setState({ vendorLoaded: returned_data, activeMenu: returned_data.activemenu });
			}
		}).catch((error) => console.log(error));
	};

	_addVendorToFav = () => {
		const vendor_id = this.props.navigation.getParam('vendorid');
		let getFavVendors = this.props.favVendors;

		if (getFavVendors.includes(parseInt(vendor_id))) {
			getFavVendors = getFavVendors.filter(elem => parseInt(elem) != parseInt(vendor_id));
		} else {
			getFavVendors.push(parseInt(vendor_id));
		}
		this.setState({ isFavVendor: getFavVendors.includes(parseInt(vendor_id)), iconAnimated: false }, () => { this.props.saveFavVendors(getFavVendors) });
	}

	_productrow = ({ item, index, section }) => {
		if (item.loadmore) {
			return <TouchableHighlight underlayColor='transparent' onPress={() => { this._loadMore(item.loadmore) }}><Text style={styles.loadMore}>{i18n.t('LoadMore')}</Text></TouchableHighlight>;
		}

		return (
			<ListItemProduct key={index} itemData={item} navigation={this.props.navigation} />
		)
	};

	_renderMenuItem = ({ item, index }) => {
		return (
			<View style={styles.menuItemWrapper}>
				<Text style={styles.menuItemTitle}>{item.title}</Text>
				<Text style={styles.menuItemTime}>{item.timing}</Text>
			</View>
		);
	};

	_menuSwitch = (slideIndex) => {
		const vendor = this.state.vendorLoaded;
		const activemenu = vendor.menus[slideIndex];
		this.setState({ activeMenu: activemenu.title });
	};

	_loadMenus = () => {
		const vendor = this.state.vendorLoaded;
		const activemenu = this.state.activeMenu !== null ? this.state.activeMenu : vendor.activemenu;
		/*
		horizontal= {true}
		decelerationRate={0}
		snapToInterval={width - 60}
		snapToAlignment={"center"}
		contentInset={{
		  top: 0,
		  left: 30,
		  bottom: 0,
		  right: 30,
		}}>
		*/
		if (vendor.menus.length > 1) {
			return (
				<Carousel
					ref={(c) => { this._carousel = c; }}
					containerCustomStyle={styles.menuWrapper}
					data={vendor.menus}
					enableMomentum={true}
					shouldOptimizeUpdates={true}
					removeClippedSubviews={true}
					decelerationRate={0.9}
					maxToRenderPerBatch={5}
					initialNumToRender={3}
					renderItem={this._renderMenuItem}
					sliderWidth={menuSliderWidth}
					itemWidth={menuItemWidth}
					inactiveSlideOpacity={1}
					inactiveSlideScale={1}
					firstItem={vendor.menus.findIndex(elem => elem.title == activemenu)}
					onSnapToItem={this._menuSwitch}
				/>
			);
		}

	};

	render() {
		const vendor_id = this.props.navigation.getParam('vendorid');


		//const vendorExtraData = this.props.appData.vendors[vendor_id];

		let vendorExtraData = {};
		this.props.appData.vendors.forEach(element => {
			if (element.id == vendor_id)
				vendorExtraData = element
		});

		if (this.props.navigation.getParam('showReviews') == true) {
			Animated.timing(this.state.showDarkBg, { toValue: .6, duration: 500, useNativeDriver: true, }).start();
		}

		//console.log("vendorExtraData", vendorExtraData);
		const vendorData = this.state.vendorLoaded;

		if (Object.keys(this.state.vendorLoaded).length == 0) {
			return (
				<View style={styles.container}>
					<StatusBar animated={true} translucent={true} backgroundColor="rgba(0,0,0,0.1)" barStyle="light-content" />
					<View style={styles.loadingHeaderPlaceholder} />
					<View style={styles.pageInnerWrapper}>
						<Loading />
					</View>
					<CartBar navigation={this.props.navigation} />
				</View>
			);
		} else {
			const headerShadow = this.state.headerElevation > 0 ? { ...Platform.select({ ios: { shadowColor: 'black', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84 }, android: { elevation: 5 } }) } : null;
			return (
				<View style={styles.container}>
					<StatusBar animated={true} translucent={true} backgroundColor="rgba(0,0,0,0.1)" barStyle="light-content" />
					<Animated.View style={[styles.storeCoverWrapper, {
						transform: [{
							translateY: this.state.slideImg.interpolate({
								inputRange: [0, coverHeight],
								outputRange: [0, -coverHeight],
								extrapolate: 'clamp',
							}),
						}]
					}]}>
						<Image style={styles.cover} source={vendorData.cover ? { uri: vendorData.cover } : require('../assets/images/placeholder.png')} />
						<LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.gradient} />
						<LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.gradientBottom} />
					</Animated.View>
					<View style={styles.headerPlaceholder} />
					<View style={[styles.header, headerShadow]}>
						<Animated.View style={{
							opacity: this.state.slideImg.interpolate({
								inputRange: [opacityStart, opacityEnd, opacityEnd + 25],
								outputRange: [0, 0, 1],
								extrapolate: 'clamp',
							}),
							height: headerHeight,
							backgroundColor: SECONDARYBUTTONSCOLOR,
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
						}} />
						<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.goBack(null) }}>
							<Feather name={rtl ? 'arrow-right' : 'arrow-left'} style={[styles.headerleftIcon, {
								color: this.state.headerIconsColor,
							}]} />
						</TouchableHighlight>
						<Animated.Text style={{
							...styles.headerStoreName,
							color: this.state.headerIconsColor,
							opacity: this.state.slideImg.interpolate({
								inputRange: [opacityStart, opacityEnd],
								outputRange: [0, 1],
								extrapolate: 'clamp',
							}),
						}}>{vendorData.name}</Animated.Text>
						<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('VendorSearch', { vendor: vendorData, vendorName: vendorData.name }) }} >
							<Feather name='search' style={[styles.headerIcon, { color: this.state.headerIconsColor }]} />
						</TouchableHighlight>
						<TouchableHighlight underlayColor='transparent' onPress={this._addVendorToFav} >
							<Animated.Text style={[styles.isFavBtnWrapper, {
								transform: [{
									scale: this.state.animateIcons
								}],
							}]}>
								<Feather name='heart' style={[this.state.isFavVendor ? styles.isFavoriteVendor : styles.headerRightIcon, {
									color: this.state.headerElevation > 0 && this.state.isFavVendor ? 'rgba(0,0,0,0.7)' : this.state.headerElevation == 0 && this.state.isFavVendor ? '#fa5555' : this.state.headerIconsColor,
								}]} />
							</Animated.Text>
						</TouchableHighlight>
					</View>
					<Animated.SectionList
						scrollEventThrottle={1}
						bounces={false}
						contentContainerStyle={styles.mainScrollView}
						showsVerticalScrollIndicator={false}
						onScroll={Animated.event(
							[{ nativeEvent: { contentOffset: { y: this.state.slideImg } } }],
							{ useNativeDriver: true, listener: this._scrollListener },
						)}
						overScrollMode="never"
						initialNumToRender={20}
						ListHeaderComponent={(
							<View style={styles.sectionListHeaderWrapper}>
								<View style={styles.storeInfoWrapper}>
									{vendorData.logo ? (
										<View style={styles.logoWrapper}>
											<Image style={styles.logo} source={{ uri: vendorData.logo }} />
										</View>
									) : null}
									<View style={styles.socialWrapper}>
										{Object.keys(vendorData.social).map(socialPointName => {
											if (socialPointName == 'facebook' && vendorData.social[socialPointName] != '') {
												return (
													<TouchableHighlight key={socialPointName} underlayColor='transparent' onPress={() => { Linking.openURL(vendorData.social[socialPointName]) }} >
														<Feather name='facebook' style={styles.socialIcons} />
													</TouchableHighlight>
												)
											} else if (socialPointName == 'instagram' && vendorData.social[socialPointName] != '') {
												return (
													<TouchableHighlight key={socialPointName} underlayColor='transparent' onPress={() => { Linking.openURL(vendorData.social[socialPointName]) }} >
														<Feather name='instagram' style={styles.socialIcons} />
													</TouchableHighlight>
												)
											} else if (socialPointName == 'twitter' && vendorData.social[socialPointName] != '') {
												return (
													<TouchableHighlight key={socialPointName} underlayColor='transparent' onPress={() => { Linking.openURL(vendorData.social[socialPointName]) }} >
														<Feather name='twitter' style={styles.socialIcons} />
													</TouchableHighlight>
												)
											} else if (socialPointName == 'youtube' && vendorData.social[socialPointName] != '') {
												return (
													<TouchableHighlight key={socialPointName} underlayColor='transparent' onPress={() => { Linking.openURL(vendorData.social[socialPointName]) }} >
														<Feather name='youtube' style={styles.socialIcons} />
													</TouchableHighlight>
												)
											}
										})}
									</View>
								</View>
								<View style={styles.storeNameWrapper}>
									<Text style={styles.storeName}>{vendorData.name}</Text>
								</View>
								<View style={styles.storeTopInfoWrapper}>
									<View style={styles.infoWithIconWrapper}>
										<Text><Feather name='map-pin' style={styles.infoIcon} /></Text>
										<Text style={styles.infoText}>{vendorData.address}</Text>
									</View>
									<View style={styles.storeTopInfoBtns}>
										{/* <TouchableHighlight underlayColor='transparent' onPress={() => { Linking.openURL('tel://' + vendorData.contact_number) }} ><Text style={styles.storeCallLink}><Feather name='phone-call' style={styles.callBtnIcon} /></Text></TouchableHighlight> */}
										<TouchableHighlight underlayColor='transparent' onPress={() => { Linking.openURL("https://www.google.com/maps/dir/?api=1&destination=" + vendorData.address_geo) }} ><Text style={styles.storeAddressLink}><Feather name='navigation' style={styles.addressBtnIcon} /></Text></TouchableHighlight>
									</View>
								</View>

								<View style={styles.storeStatusWrapper} >
									<Text><Feather name='clock' style={vendorData.is_open ? styles.storeIsOpenIcon : styles.storeIsClosedIcon} /></Text>
									{i18n.locale == 'de' ? (
										< Text style={vendorData.is_open ? styles.storeIsOpen : styles.storeIsClosed}>{vendorData.timing_status_de}</Text>
									) : (
										<Text style={vendorData.is_open ? styles.storeIsOpen : styles.storeIsClosed}>{vendorData.timing_status}</Text>
									)}
								</View>

								{/* <View style={styles.storeRatingWrapper} >
									<Image resizeMode='cover' style={{ height: 12, width: 12, marginRight: 8 }} source={require('../assets/images/star.png')} />
									<Text style={styles.ratingText}>{vendorData.rating}</Text>
								</View> */}


								{vendorData.rating > 0 ? (
									<TouchableHighlight underlayColor='transparent' onPress={() => {
										this.props.navigation.setParams({ showReviews: true });
									}}>
										<View style={styles.vendorRatingWrapper} >
											<Text><Feather name='star' style={styles.vendorRatingIcon} /></Text>
											<Text style={styles.vendorRating}>{i18n.toNumber(vendorData.rating, { precision: 1 })}  ({i18n.toNumber(vendorData.review_count, { precision: 1, strip_insignificant_zeros: true })} {vendorData.review_count > 1 ? <Text>{i18n.t('VENDOR_Reviews')}</Text> : <Text>{i18n.t('VENDOR_Review')}</Text>})</Text>
										</View>
									</TouchableHighlight>
								) : null}


								<View style={styles.storeDistanceWrapper}>
									{vendorExtraData && vendorExtraData.distance || vendorExtraData.distance === 0 ? (
										<View style={styles.distanceWrapper}>
											<DistanceIcon style={styles.distaneIcon} height={15} width={15} />
											{vendorExtraData.distance / this.props.distanceDivider > 1 ? (
												<Text style={styles.distance}>{i18n.toNumber((vendorExtraData.distance / this.props.distanceDivider), { precision: 1, strip_insignificant_zeros: false })} {this.props.distanceUnitFullName}</Text>
											) : vendorExtraData.distance === 0 ? (
												<Text style={styles.distance}>{i18n.t('FEATUREDVENDOR_FewMetersAway')}</Text>
											) : (
												<Text style={styles.distance}>{i18n.toNumber(vendorExtraData.distance, { precision: 1, strip_insignificant_zeros: false })} {i18n.t('VENDOR_MetersAway')}</Text>
											)}
										</View>
									) : null}

									{vendorExtraData && vendorExtraData.duration || vendorExtraData.duration === 0 ? (
										<View style={styles.deliversInWrapper}>
											{/* <DeliveryIcon style={styles.deliversInIcon} height={15} width={15} /> */}
											<Feather name='clock' style={styles.deliversInIcon} />
											{vendorData.custom_delivery_duration ? (
												<Text style={styles.deliversIn}>{vendorData.custom_delivery_duration} {i18n.t('FEATUREDVENDOR_Min')}</Text>
											) : vendorExtraData.duration === 0 ? (
												<Text style={styles.deliversIn}>{i18n.t('FEATUREDVENDOR_FewMinutes')}</Text>
											) : (
												<Text style={styles.deliversIn}>{i18n.toNumber(parseInt(vendorExtraData.duration / 60), { precision: 0 })} - {i18n.toNumber(parseInt(vendorExtraData.duration / 60) + 10, { precision: 0, strip_insignificant_zeros: false })} {i18n.t('VENDOR_Minutes')}</Text>
											)}
										</View>
									) : null}
									{vendorData.is_busy ? (
										<TouchableHighlight underlayColor='transparent' onPress={() => {
											Alert.alert(null, vendorData.delivery_fee > 0 ? i18n.t('VENDOR_DeliveryFeesChange', { fee: i18n.toNumber(vendorData.delivery_fee, { precision: 3, strip_insignificant_zeros: false }), per: vendorData.delivery_fee_by }) : i18n.t('VENDOR_VendorBusy', { name: vendorData.name }));
										}}>
											<View style={styles.storeIsBusy}>
												<AlarmIcon style={styles.storeIsBusyIcon} height={15} width={15} />
												<Text style={styles.storeIsBusyText}>{i18n.t('VENDOR_Busy')} <Feather name='info' width={15} height={15} /></Text>
											</View>
										</TouchableHighlight>
									) : null}
									{this.props.orderType == 'delivery' && vendorData.min_delivery > 0 ? (
										<View style={styles.minDeliveryWrapper}>
											<NotesIcon style={styles.minDeliveryIcon} height={15} width={15} />
											<Text style={styles.minDelivery} >{i18n.t('VENDOR_MinDeliveryOrder')} {i18n.toCurrency(vendorData.min_delivery > 0 ? vendorData.min_delivery : 0.0, APPCURRENCY_FORMAT)}</Text>
										</View>
									) : null}
								</View>
								{
									vendorData.notice ? (
										<View style={styles.storeNoticeWrapper}>
											<Text style={styles.storeNotice}>{vendorData.notice}</Text>
										</View>
									) : null
								}

								<View style={styles.storeTagsWrapper}>
									{vendorData.vendorclass.map((elem, index) => <TouchableHighlight underlayColor='transparent' key={index} numberOfLines={1} onPress={() => this.props.navigation.navigate('VendorTag', { tag: elem })}><Text style={styles.storeTag}><Feather name='tag' width={15} height={15} /> {elem}</Text></TouchableHighlight>)}
								</View>

								<View>
									{this._loadMenus()}
								</View>
							</View >
						)
						}
						renderItem={this._productrow}
						renderSectionHeader={({ section: { title } }) => (
							<View>
								<Image resizeMode='cover' style={{ borderTopRightRadius: 10, borderTopLeftRadius: 10, marginLeft: 16, height: 100, width: menuSliderWidth - 32 }} source={vendorData.productcatsImg[title] ? { uri: vendorData.productcatsImg[title] } : require('../assets/images/placeholder.png')} />
								<Text style={styles.sectionTitle}>{title}</Text>
							</View>
						)
						}
						renderSectionFooter={({ section: { title } }) => (
							<View collapsable={false} style={styles.sectionfooter}></View>
						)}
						sections={this._rendersection()}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={true}
						ListEmptyComponent={(
							<View style={styles.noItemsWrapper}>
								<Feather name='info' style={styles.noResultsIcon} />
								<Text style={styles.noItemMessage}>{i18n.t('VENDOR_NoItems')}</Text>
							</View>
						)}
					/>

					< CartBar navigation={this.props.navigation} />
					<VendorReviews navigation={this.props.navigation} vendor_id={vendor_id} showReviews={this.props.navigation.getParam('showReviews')} />

					{
						this.props.navigation.getParam('showReviews') ? (
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
						) : null
					}
				</View >
			);
		}
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	pageInnerWrapper: {
		flex: 1,
	},
	loadingHeaderPlaceholder: {
		height: coverHeight,
		backgroundColor: '#f1f1f1',
	},
	storeCoverWrapper: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: coverHeight,
	},
	cover: {
		height: coverHeight,
		width: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
	},
	gradient: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		height: 100,
	},
	gradientBottom: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 100,
	},
	headerPlaceholder: {
		backgroundColor: 'transparent',
		height: headerHeight,
		width: '100%',
		position: 'relative',
		overflow: 'hidden',
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: headerHeight,
		backgroundColor: 'transparent',
		position: 'absolute',
		top: 0,
		left: 0,
		zIndex: 10,
		overflow: 'hidden',
		width: '100%',
		paddingTop: getStatusBarHeight() + 4,
		paddingLeft: 16,
		paddingRight: 16,
	},
	headerleftIcon: {
		fontSize: 24,
	},
	headerStoreName: {
		fontSize: 20,
		fontFamily: APPFONTMEDIUM,
		flex: 1,
		marginLeft: 32,
		textAlign: 'left',
	},
	headerRightIcon: {
		fontSize: 24,
	},
	headerIcon: {
		fontSize: 24,
		paddingRight: rtl ? 0 : 24,
		paddingLeft: rtl ? 24 : 0,
	},
	isFavBtnWrapper: {
	},
	isFavoriteVendor: {
		fontSize: 24,
		color: '#fff',
	},
	mainScrollView: {
		position: 'relative',
	},
	sectionListHeaderWrapper: {
		marginTop: coverHeight - headerHeight - 90,
		position: 'relative',
	},
	storeInfoWrapper: {
		height: 90,
		width: '100%',
		position: 'relative',
	},
	logoWrapper: {
		backgroundColor: '#fff',
		height: 92,
		width: 92,
		borderRadius: 46,
		position: 'absolute',
		bottom: -42,
		right: 16,
		zIndex: 11,
		overflow: 'hidden',
	},
	logo: {
		height: 80,
		width: 80,
		position: 'absolute',
		top: 6,
		left: 6,
		borderRadius: 40,
		overflow: 'hidden',
	},
	socialWrapper: {
		height: 40,
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		position: 'absolute',
		zIndex: 50,
		bottom: 6,
		paddingLeft: 16,
		paddingRight: 16,
	},
	socialIcons: {
		margin: 4,
		padding: 4,
		borderRadius: 8,
		fontSize: 20,
		color: '#fff',
		overflow: 'hidden',
	},
	storeNameWrapper: {
		marginTop: 10,
		marginBottom: 16,
		marginLeft: 16,
		marginRight: 16,

	},
	storeName: {
		fontSize: 24,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	storeTopInfoWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		paddingBottom: 16,
		marginLeft: 16,
	},
	infoWithIconWrapper: {
		display: 'flex',
		flexDirection: 'row',
		flex: 1,
	},
	infoIcon: {
		fontSize: 14,
		color: '#1e1e1e',
	},
	infoText: {
		marginLeft: 8,
		width: '80%',
		overflow: 'hidden',
		fontFamily: APPFONTREGULAR,
		fontSize: 14,
		color: '#1e1e1e',
		textAlign: 'left',
	},
	storeTopInfoBtns: {
		display: 'flex',
		flexDirection: 'row-reverse',
		alignItems: 'center',
	},
	storeAddressLink: {
		backgroundColor: PRIMARYBUTTONCOLOR,
		paddingTop: 11,
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 16,
		overflow: 'hidden',
		textAlign: 'center',
	},
	storeCallLink: {
		backgroundColor: SECONDARYBUTTONSCOLOR,
		paddingTop: 11,
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 16,
		overflow: 'hidden',
		textAlign: 'center',
	},
	addressBtnIcon: {
		fontSize: 18,
		color: PRIMARYBUTTONTEXTCOLOR,
		textAlign: 'center',
	},
	callBtnIcon: {
		fontSize: 18,
		color: SECONDARYBUTTONSTEXTCOLOR,
		textAlign: 'center',
	},
	storeStatusWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 16,
		marginTop: 16,
		marginRight: 16,
		marginBottom: 8,
	},
	storeRatingWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 16,
		marginRight: 16
	},
	storeIsOpen: {
		color: '#000',//PRIMARYBUTTONCOLOR,
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		marginLeft: 8,
	},
	ratingText: {
		color: "#000",
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		marginLeft: 8,
	},
	storeIsClosed: {
		color: '#000',//SECONDARYBUTTONSCOLOR,
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		marginLeft: 8,
	},
	storeIsOpenIcon: {
		fontSize: 14,
		color: '#000'//PRIMARYBUTTONCOLOR,
	},
	storeIsClosedIcon: {
		fontSize: 14,
		color: '#000'//SECONDARYBUTTONSCOLOR,
	},
	vendorRatingWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 8,
	},
	vendorRatingIcon: {
		fontSize: 14,
		color: PRIMARYBUTTONCOLOR,
	},
	vendorRating: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		marginLeft: 8,
	},
	storeDistanceWrapper: {
		marginLeft: 16,
		marginRight: 16,
	},
	deliversInWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	deliversInIcon: {
		marginRight: 8,
	},
	deliversIn: {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#1e1e1e',
	},
	distanceWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	distaneIcon: {
		marginRight: 8,
	},
	distance: {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#1e1e1e'
	},
	storeIsBusy: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	storeIsBusyText: {
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		color: SECONDARYBUTTONSCOLOR
	},
	storeIsBusyIcon: {
		marginRight: 8,
	},
	minDeliveryWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	minDeliveryIcon: {
		marginRight: 8,
	},
	minDelivery: {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#1e1e1e'
	},
	storeNoticeWrapper: {
		backgroundColor: MODALBODYCOLOR,
		padding: 16,
		borderTopLeftRadius: 5,
		borderBottomLeftRadius: 5,
		overflow: 'hidden',
		marginLeft: 16,
		marginTop: 16,
		marginBottom: 16,
	},
	storeNotice: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	storeTagsWrapper: {
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 16,
		marginTop: 8,
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	storeTag: {
		color: '#1e1e1e',
		paddingTop: 3,
		paddingBottom: 3,
		paddingRight: 8,
		borderRadius: 7,
		overflow: 'hidden',
		marginRight: 12,
		textTransform: 'uppercase',
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
	},
	menuWrapper: {
		backgroundColor: '#eeeeee',
		paddingTop: 16,
		paddingBottom: 16,
	},
	menuItemWrapper: {
		marginLeft: 10,
		marginRight: 10,
		backgroundColor: '#fff',
		borderRadius: 7,
		overflow: 'hidden',
	},
	menuItemTitle: {
		textAlign: 'center',
		padding: 6,
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
	},
	menuItemTime: {
		textAlign: 'center',
		paddingBottom: 6,
		fontSize: 12,
		fontFamily: APPFONTREGULAR,
		color: PRIMARYBUTTONCOLOR,
	},
	noItemsWrapper: {
		display: 'flex',
		alignItems: 'center',
		marginTop: 50,
		marginLeft: 16,
		marginRight: 16,
	},
	noResultsIcon: {
		fontSize: 56,
		color: '#1e1e1e',
	},
	noItemMessage: {
		marginTop: 20,
		textAlign: 'center',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
	},
	sectionTitle: {
		padding: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.32)',
		fontFamily: APPFONTMEDIUM,
		fontSize: 18,
		color: '#fff',
		textAlign: 'left',
		position: 'absolute',
		left: 16,
		right: 16,
		bottom: 0
	},
	loadMore: {
		borderRadius: 7,
		paddingLeft: 16,
		paddingRight: 16,
		marginLeft: 16,
		marginRight: 16,
		height: 36,
		paddingTop: 8,
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		textAlign: 'center',
		alignSelf: 'flex-end',
		overflow: 'hidden',
	},
	sectionfooter: {
		marginLeft: 16,
		marginTop: 8,
		marginBottom: 8,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)'
	},

});

const mapStateToProps = state => {
	return {
		appData: state.appData,
		favVendors: state.favVendors,
		orderType: state.orderType,
		distanceDivider: state.distanceDivider,
		distanceUnitFullName: state.distanceUnitFullName,

	};
};

const mapDispatchToProps = dispatch => {
	return {
		saveFavVendors: (vendorslist) => dispatch({ type: 'SAVEFAVVENDORS', data: vendorslist }),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(VendorScreen);