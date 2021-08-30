import React from 'react';
import { connect } from 'react-redux';
import NorsaniDynamicPicker from "../components/NorsaniDynamicPicker";
import { Animated, Text, Platform, StatusBar, StyleSheet, TextInput, Alert, Image, View, Button, ScrollView, KeyboardAvoidingView, TouchableOpacity, TouchableHighlight } from 'react-native';
import { Norsani } from '../Norsani';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, SECONDARYBUTTONSCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, APPCURRENCY_FORMAT, STATUSBARCOLOR } from '../config';
import { Loading } from '../components/Loading';
import Feather from 'react-native-vector-icons/Feather';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import LinearGradient from 'react-native-linear-gradient';
import i18n, { rtl } from '../i18n/config';
import Coupon from '../assets/images/Coupon';

let special_notes = null;
const headerHeight = 56 + getStatusBarHeight();

class ProductModalScreen extends React.Component {
	state = {
		selectedVariation: {},
		productData: this.props.navigation.getParam('product') ? this.props.navigation.getParam('product') : null,
		addingToCart: false,
		productQty: 1,
		iconAnimated: true,
		animateIcons: new Animated.Value(1),
		isFavItem: this.props.navigation.getParam('productID') > 0 ? this.props.favItems.includes(parseInt(this.props.navigation.getParam('productID'))) : this.props.favItems.includes(parseInt(this.props.navigation.getParam('product').id)),
		screenScroll: new Animated.Value(0),
		noCover: false
	}

	componentDidUpdate = (prevProps, prevState, snapshot) => {


		if (this.state.addingToCart) {
			this._addToCart();
		}
		if (prevState.isFavItem != this.state.isFavItem && !this.state.iconAnimated) {
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
	};

	_addItemToFav = () => {
		const product = this.state.productData;
		let getFavItems = this.props.favItems;

		if (getFavItems.includes(parseInt(product.id))) {
			getFavItems = getFavItems.filter(elem => parseInt(elem) != parseInt(product.id));
		} else {
			getFavItems.push(parseInt(product.id));
		}
		this.setState({ isFavItem: getFavItems.includes(parseInt(product.id)), iconAnimated: false }, () => { this.props.saveFavItems(getFavItems) });
	}

	_addToCart = async () => {

		const product = this.state.productData;
		const deliveryVendors = this.props.deliveryVendors;
		const productId = product.id;
		const variationId = this.state.selectedVariation.id ? this.state.selectedVariation.id : 0;
		const quantity = this.state.productQty > 0 ? this.state.productQty : 1;
		const order_type = this.props.orderType;
		const vendorExtraData = this.props.appData.vendors[product.vendor_id];
		let cart_data = this.props.cartItemsData;
		let addingSameOrderType = true;

		if (deliveryVendors.length > 0 && !deliveryVendors.includes(parseInt(product.vendor_id))) {
			Alert.alert(null, i18n.t('ATC_DeliveryLocationNotSupported', { name: product.vendor_name }));
			this.setState({ addingToCart: false });
			return false;
		}

		for (const [key, val] of Object.entries(cart_data)) {
			if (!cart_data[key].items.every(cartItem => cartItem.orderType == order_type)) {
				addingSameOrderType = false;
				break;
			}
		}

		/**
		 * Update cart items data
		 * The cart can only accept one order type at once
		 */
		const newCartItemsData = {
			productID: productId,
			imagelink: product.imagelink,
			variationID: variationId,
			qty: quantity,
			orderType: order_type,
			specialNotes: special_notes,
			variations: variationId > 0 ? this.state.selectedVariation.options : null,
			price: variationId > 0 ? this.state.selectedVariation.price : product.price,
			name: product.title,
			maxOrders: product.maxorders,
			remainingOrders: product.remainingorders,
			minQty: product.min_qty,
		};

		if (cart_data[product.vendor_id] && addingSameOrderType) {
			cart_data[product.vendor_id].items.push(newCartItemsData);
		} else {
			if (!addingSameOrderType) {
				cart_data = {};
			}
			cart_data[product.vendor_id] = {};
			cart_data[product.vendor_id].items = [newCartItemsData];
		}

		/*If order is delivery we must add the distance to the user's location for checkout delivery fee calculations*/
		if (order_type == 'delivery') {
			cart_data[product.vendor_id].distance = vendorExtraData && vendorExtraData.distance ? vendorExtraData.distance : 0;
		}

		/*Add to cart*/
		Promise.all([
			await Norsani.post('addtocart', 'norsani', { cartData: cart_data, coupons: this.props.coupons }).then((data) => {
				let validCoupons = crossSells = [];

				console.log("addtocart", data)

				if (data.data && data.data.status == 500) {
					Alert.alert(i18n.t('ATC_Notices'), i18n.t('CART_SomethingWentWrong'));
					cart_data = {}
					this.setState({ addingToCart: false }, () => { this.props.saveCart({}, cart_data, crossSells, validCoupons) });
					return false;
				}
				const returned_data = JSON.parse(data);
				crossSells = returned_data.cross_sells;

				if (returned_data.messages.length > 0) {
					Alert.alert(i18n.t('ATC_Notices'), returned_data.messages.join(', '));
				}

				/*Save coupons*/
				if (returned_data.totals.coupons.length > 0) {
					returned_data.totals.coupons.map((elem, index) => {
						validCoupons.push(elem.code);
					});
				}

				/*save added data*/
				for (const [key, val] of Object.entries(cart_data)) {

					let cartdata = [];

					if (returned_data.added_data[key] == undefined) {
						delete cart_data[key];
						continue;
					}

					const vendor_items = returned_data.added_data[key].items;
					vendor_items.map(elem => {
						const founded_item_data = cart_data[key].items.find(cartItem => {

							if (cartItem.productID == elem.product_id && cartItem.variationID == elem.variation_id) {
								if (elem.variation_id > 0 && Object.keys(cartItem.variations).length > 0) {
									return Object.values(cartItem.variations).every(option => Object.values(elem.variation).includes(option));
								} else {
									return true;
								}
							}
							return false;

						});
						if (founded_item_data) {
							founded_item_data.data = elem.data;
							founded_item_data.qty = elem.quantity;
							founded_item_data.specialNotes = elem.item_comments ? elem.item_comments : null;
							founded_item_data.promotions = elem.applied_promotions ? elem.applied_promotions : [];
							founded_item_data.total = elem.line_total;
							founded_item_data.realPrice = elem.price;

							cartdata.push(founded_item_data);
						}
					});
					cart_data[key].items = cartdata;
				}

				this.setState({ addingToCart: false }, () => { this.props.saveCart(returned_data.totals, cart_data, crossSells, validCoupons) });

			}).catch(error => { console.log(error) })

		]).then(() => this.props.navigation.goBack());
	};

	render() {
		const product_id = this.props.navigation.getParam('productID');
		const product = this.state.productData;
		const getFavItems = this.props.favItems;

		if (product_id && !product) {
			/*call product data*/
			Norsani.get('getproduct/' + parseInt(product_id), 'norsani').then((data) => {
				const returned_data = JSON.parse(data);
				this.setState({ productData: returned_data });
			});
			return (
				<View style={styles.wrapper}>
					<StatusBar animated={true} translucent={true} backgroundColor="rgba(0,0,0,0.1)" barStyle="light-content" />
					<View style={styles.loadingHeaderPlaceholder} />
					<Loading />
				</View>
			);
		}

		if (!product.imagelink && this.state.noCover == false)
			this.setState({ screenScroll: new Animated.Value(150), noCover: true })

		if (!product.is_offline) {
			
			const variationRawPrice = product.variations.length > 0 ? product.price.split('-') : [];
			let variationPrice = 0;//product.variations.length > 0 ? i18n.toNumber(variationRawPrice[0], { precision: 3, strip_insignificant_zeros: true }) : 0;
			if (variationRawPrice.length > 1) {
				variationPrice = 0//i18n.toNumber(variationRawPrice[0], { precision: 3, strip_insignificant_zeros: true }) + ' - ' + i18n.toNumber(variationRawPrice[1], { precision: 3, strip_insignificant_zeros: true });
			}

			const headerShadow = this.state.headerElevation > 0 ? { ...Platform.select({ ios: { shadowColor: 'black', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84 }, android: { elevation: 5 } }) } : null;

			console.log("selectedVariation",this.state.selectedVariation);

			return (
				<View style={styles.wrapper}>
					<StatusBar animated={true} translucent={true} backgroundColor="rgba(0,0,0,0.1)" barStyle="light-content" />
					{product.imagelink ? (
						<View style={styles.itemImagewrapper} >
							<Image style={styles.itemImage} resizeMode='cover' source={product.imagelink ? { uri: product.imagelink } : require('../assets/images/placeholder.png')} />
							<LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.gradient} />
						</View>) : null}


					{product.imagelink ? (
						<View style={styles.headerImagewrapper} >
							<Image style={styles.headerImage} resizeMode='cover' source={product.imagelink ? { uri: product.imagelink } : require('../assets/images/placeholder.png')} />
							<LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.gradient} />
						</View>
					) : (
						<View style={styles.headerImagewrapper} >
							<Image style={styles.headerImage} resizeMode='cover' source={product.imagelink ? { uri: product.imagelink } : require('../assets/images/placeholder.png')} />
							<LinearGradient colors={[STATUSBARCOLOR, STATUSBARCOLOR]} style={styles.gradient} />
						</View>)}


					<View style={[styles.header, headerShadow, { backgroundColor: product.imagelink ? 'transparent' : STATUSBARCOLOR }]}>
						<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.goBack() }} >
							<Feather name={rtl ? 'arrow-right' : 'arrow-left'} style={[styles.headerIcon, { color: product.imagelink ? '#fff' : '#000' }]} />
						</TouchableHighlight>
						<Animated.Text numberOfLines={1} style={{
							...styles.headerTitle,
							color: product.imagelink ? '#fff' : '#000',
							opacity: this.state.screenScroll.interpolate({
								inputRange: [0, 134, 140],
								outputRange: [0, 0, 1],
								extrapolate: 'clamp',
							}),
						}}>{product.title}</Animated.Text>
						<TouchableHighlight underlayColor='transparent' onPress={this._addItemToFav} >
							<Animated.Text style={[styles.isFavBtnWrapper, {
								transform: [{
									scale: this.state.animateIcons
								}],
							}]}>
								<Feather name='heart' style={[this.state.isFavItem ? styles.isFavItem : styles.favIcon, { color: this.state.isFavItem ? '#ff0000' : product.imagelink ? '#fff' : '#000' }]} />
							</Animated.Text>
						</TouchableHighlight>
					</View>

					<Animated.ScrollView
						scrollEventThrottle={1}
						bounces={false}
						showsVerticalScrollIndicator={false}
						onScroll={Animated.event(
							[{ nativeEvent: { contentOffset: { y: this.state.screenScroll } } }],
							{ useNativeDriver: true },
						)}
						overScrollMode="never"
						contentContainerStyle={product.imagelink ? styles.mainScrollView : {}}
					>
						<View style={styles.scrollInner}>

							<View style={styles.productTitleWrapper}>

								{product.imagelink ? (
									<Text style={styles.itemTitle}>{product.title}</Text>
								) : null}

								{product.rating > 0 ? (
									<Text style={styles.rating}>{product.rating}</Text>
								) : null}
							</View>

							{product.excerpt ? (
								<Text style={styles.description}>{product.excerpt}</Text>
							) : null}

							<View style={styles.separator} collapsable={false} />

							{product.has_coupon ? (
								product.coupons.map((coupon, index) => (
									<View key={index} style={styles.hasCoupon}>
										<Coupon style={styles.couponIcon} width={24} height={24} />
										<Text style={styles.couponMsg}>{coupon.message}</Text>
									</View>
								))
							) : null}

							<View style={styles.infoContainer}>
								{product.categories.length > 0 ? (
									<View style={styles.infoWrapper}>
										<Text style={styles.infoTitle}>{i18n.t('ATC_Categories')}</Text>
										<Text style={styles.infoValue}>{product.categories.join(', ')}</Text>
									</View>
								) : null}
								{product.ingredients.length > 0 ? (
									<View style={styles.infoWrapper}>
										<Text style={styles.infoTitle}>{i18n.t('ATC_Ingredients')}</Text>
										<Text style={styles.infoValue}>{product.ingredients.join(', ')}</Text>
									</View>
								) : null}
								{product.preparation ? (
									<View style={styles.infoWrapper}>
										<Text style={styles.infoTitle}>{i18n.t('ATC_PreparationHandlingTime')}</Text>
										<Text style={styles.infoValue}>{i18n.toNumber(product.preparation, { precision: 3, strip_insignificant_zeros: true })} {i18n.t('ATC_Minutes')}</Text>
									</View>
								) : null}
								{product.promotions.length > 0 ? (
									<View style={styles.infoWrapper}>
										<Text style={styles.infoTitle}>{i18n.t('ATC_Promotions')}</Text>
										<View>
											{product.promotions.map((item, index) => {
												if (item.discount) {
													return (
														<Text style={styles.infoValue} key={index}>{i18n.t('ATC_Buy')} {item.buy} {i18n.t('ATC_Get')} {item.discount} % {item.get}</Text>
													)
												} else {
													return (
														<Text style={styles.infoValue} key={index}>{i18n.t('ATC_Buy')} {item.buy} {i18n.t('ATC_Get')} {item.get} {item.value}</Text>
													)
												}
											})
											}
										</View>
									</View>
								) : null}
								{parseInt(product.remainingorders) > 0 ? (
									<View style={styles.infoWrapper}>
										<Text style={styles.infoTitle}>{i18n.t('ATC_RemainingQty')}</Text>
										<Text style={styles.infoValue}>{i18n.toNumber(product.remainingorders, { precision: 3, strip_insignificant_zeros: true })}</Text>
									</View>
								) : null}
							</View>

							{product.variations.length > 0 ? (
								<View style={styles.separator} collapsable={false} />
							) : null}

							{product.variations.length > 0 ? (

								<View style={styles.variations}>
									<Text style={styles.optionsTitle}>{i18n.t('ATC_SelectOptions')}</Text>
									<NorsaniDynamicPicker variations={product.variations} variationOptions={product.vairationsoptions} saveSelectedVars={(dataObj) => { this.setState({ selectedVariation: dataObj }) }} />
									{this.state.selectedVariation.description ? (
										<Text style={styles.variationDescription}>{this.state.selectedVariation.description}</Text>
									) : null}
								</View>
							) : null}

							<View style={styles.separator} collapsable={false} />

							<KeyboardAvoidingView behavior="padding" enabled>
								<View style={styles.notes}>
									<Text style={styles.specialNotesTitle}>{i18n.t('ATC_SpecialNotes')}</Text>
									<TextInput style={styles.specialNotes} multiline={true} numberOfLines={2} onEndEditing={(e) => { special_notes = e.nativeEvent.text }} />
								</View>
							</KeyboardAvoidingView>

						</View>
					</Animated.ScrollView>

					<View style={styles.addToCartWrapper}>
						<View style={styles.atcHeader}>
							<View style={styles.priceWrapper}>
								{product.variations.length == 0 ? (
									<Text style={styles.price}>{i18n.toCurrency((this.state.productQty * product.price), APPCURRENCY_FORMAT)}</Text>
								) : (
									<Text style={styles.price}>{this.state.selectedVariation.price > 0 ? i18n.toCurrency((this.state.productQty * this.state.selectedVariation.price), APPCURRENCY_FORMAT) : i18n.toCurrency(variationPrice, APPCURRENCY_FORMAT)}</Text>
								)}
							</View>

							<View style={styles.itemQty}>


								<TouchableOpacity onPress={() => {
									if (this.state.productQty != parseInt(product.min_qty)) {
										this.setState({ productQty: this.state.productQty - 1 });
									}
								}}>
									<Feather name='minus-square' style={styles.qtyBtn} />
								</TouchableOpacity>

								<TextInput style={styles.qtyInput} defaultValue={String(i18n.toNumber(this.state.productQty, { precision: 3, strip_insignificant_zeros: true }))} keyboardType='number-pad' textContentType='telephoneNumber' onEndEditing={(e) => {
									if (parseInt(product.remainingorders) > 0 && parseInt(e.nativeEvent.text) > parseInt(product.remainingorders)) {
										Alert.alert(null, i18n.t('ATC_QtyLimit', { count: i18n.toNumber(product.remainingorders, { precision: 3, strip_insignificant_zeros: true }) }))
										this.setState({ productQty: parseInt(product.remainingorders) });
									} else if (parseInt(e.nativeEvent.text) > 0) {
										this.setState({ productQty: parseInt(e.nativeEvent.text) });
									} else {
										Alert.alert(i18n.t('Error'), i18n.t('ATC_InvalidQuantityInput'));
									}
								}}
								/>

								<TouchableOpacity onPress={() => {
									if (this.state.productQty != parseInt(product.remainingorders)) {
										this.setState({ productQty: this.state.productQty + 1 });
									}
								}}>
									<Feather name='plus-square' style={styles.qtyBtn} />
								</TouchableOpacity>


							</View>
						</View>

						<TouchableHighlight underlayColor='transparent' onPress={() => {
							if (product.variations.length > 0 && !this.state.selectedVariation.id) {
								Alert.alert(i18n.t('ATC_Notice'), i18n.t('ATC_VariationError'));
								return false;
							}
							this.setState({ addingToCart: true })
						}} >
							<Text style={styles.atcBtn}>{i18n.t('ATC_AddToCart')}</Text>
						</TouchableHighlight>

					</View>

					{this.state.addingToCart ? <Loading /> : null}

				</View>
			);
		} else {
			return (
				<View style={styles.wrapper}>
					<StatusBar animated={true} translucent={true} backgroundColor="rgba(0,0,0,0.1)" barStyle="light-content" />
					<View style={styles.productMessageWrapper}>
						<Text style={styles.productMessageIconWrapper}><Feather name='info' style={styles.productMessageIcon} /></Text>
						<Text style={styles.productMessage}>{i18n.t('ATC_ProductUnavailable')}</Text>
					</View>
				</View>
			);
		}
	}
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: '#fff',
	},
	loadingHeaderPlaceholder: {
		height: 200,
		backgroundColor: '#f1f1f1',
	},
	headerImagewrapper: {
		height: 56 + getStatusBarHeight(),
		overflow: 'hidden',
	},
	headerImage: {
		width: '100%',
		height: 200,
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: getStatusBarHeight(),
		padding: 13,
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
	},
	headerIcon: {
		fontSize: 24,
		color: '#fff',
		paddingLeft: 16,
	},
	headerTitle: {
		fontSize: 20,
		fontFamily: APPFONTMEDIUM,
		color: '#fff',
		flex: 1,
		marginLeft: 32,
		textAlign: 'left',
	},
	isFavBtnWrapper: {
		paddingRight: 16,
	},
	isFavItem: {
		fontSize: 24,
		color: SECONDARYBUTTONSCOLOR,
	},
	favIcon: {
		fontSize: 24,
		color: '#fff',
	},
	itemImagewrapper: {
		position: 'absolute',
		height: 200,
		top: 0,
		left: 0,
		width: '100%',
	},
	gradient: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		height: 100,
	},
	itemImage: {
		width: '100%',
		height: 200,
	},
	mainScrollView: {
		paddingTop: 100,
	},
	scrollInner: {
		backgroundColor: '#fff',
	},
	productTitleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		margin: 16,
	},
	itemTitle: {
		fontSize: 18,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	rating: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
	},
	description: {
		color: '#666',
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 16,
		textAlign: 'left',
	},
	separator: {
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		marginLeft: 16,
	},
	hasCoupon: {
		position: 'relative',
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 16,
		marginTop: 32,
	},
	couponIcon: {
		position: 'absolute',
		top: -12,
		left: '50%',
		marginLeft: -12,
	},
	couponMsg: {
		borderStyle: 'dashed',
		borderWidth: 1,
		borderColor: SECONDARYBUTTONSCOLOR,
		borderRadius: 7,
		overflow: 'hidden',
		padding: 16,
		textAlign: 'center',
		color: '#666',
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
	},
	infoContainer: {
		margin: 16,
	},
	infoWrapper: {
		minHeight: 56,
	},
	infoTitle: {
		textTransform: 'uppercase',
		fontSize: 12,
		marginTop: 14,
		marginBottom: 4,
		fontFamily: APPFONTREGULAR,
		color: '#666',
		textAlign: 'left',
	},
	infoValue: {
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		textAlign: 'left',
	},
	variations: {
		margin: 16,
	},
	optionsTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	variationDescription: {
		color: '#666',
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		textAlign: 'left',
	},
	notes: {
		margin: 16,
	},
	specialNotesTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		marginBottom: 12,
	},
	specialNotes: {
		height: 80,
		borderRadius: 7,
		backgroundColor: '#f1f1f1',
		width: '100%',
		color: '#1e1e1e',
		fontSize: 14,
		paddingLeft: 12,
		paddingRight: 12,
		fontFamily: APPFONTREGULAR,
		overflow: 'hidden',
	},
	addToCartWrapper: {
		backgroundColor: '#fff',
		...Platform.select({
			ios: {
				shadowColor: 'black',
				shadowOffset: { height: -3 },
				shadowOpacity: 0.1,
				shadowRadius: 3,
				paddingBottom: getStatusBarHeight(),
			},
			android: {
				elevation: 20,
			},
		}),
		padding: 16,
	},
	atcHeader: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	price: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	priceWrapper: {
		flex: 1,
	},
	itemQty: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	qtyInput: {
		flex: 2,
		color: '#1e1e1e',
		fontSize: 18,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
	},
	qtyBtn: {
		fontSize: 32,
		color: SECONDARYBUTTONSCOLOR,
		paddingLeft: 6,
		paddingRight: 6,
	},
	atcBtn: {
		borderRadius: 10,
		paddingLeft: 16,
		paddingRight: 16,
		marginTop: 16,
		height: 40,
		paddingTop: 12,
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 16,
		lineHeight: 18,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
		overflow: 'hidden',
		textTransform: 'capitalize',
	},
	productMessageWrapper: {
		display: 'flex',
		alignItems: 'center',
		marginTop: 50,
		marginLeft: 16,
		marginRight: 16,
	},
	productMessageIconWrapper: {
		textAlign: 'center',
		paddingTop: 36,
	},
	productMessageIcon: {
		fontSize: 56,
		color: '#1e1e1e',
	},
	productMessage: {
		marginTop: 20,
		color: '#1e1e1e',
		fontSize: 18,
		fontFamily: APPFONTMEDIUM,

	}
});

const mapStateToProps = state => {
	return {
		appData: state.appData,
		cartItemsData: state.cartItemsData,
		orderType: state.orderType,
		coupons: state.coupons,
		crossSells: state.crossSells,
		favItems: state.favItems,
		deliveryVendors: state.deliveryVendors,
		loggedInWith: state.loggedInWith,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		saveFavItems: (itemslist) => dispatch({ type: 'SAVEFAVITEMS', data: itemslist }),
		saveCart: (totals, cart_data, cross_sells, coupons_data) => dispatch({ type: 'SAVECART', total: totals, cartitemsdata: cart_data, crosssells: cross_sells, coupons: coupons_data })
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductModalScreen);