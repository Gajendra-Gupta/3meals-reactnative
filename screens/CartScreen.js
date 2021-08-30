import React from 'react';
import { Animated, StyleSheet, Modal, StatusBar, ScrollView, Platform, Dimensions, View, TouchableHighlight, KeyboardAvoidingView, Text, Alert, Image, TextInput } from 'react-native';
import { Norsani } from '../Norsani';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, STATUSBARCOLOR, MODALBODYCOLOR, SECONDARYBUTTONSCOLOR, SECONDARYBUTTONSTEXTCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, APPCURRENCY_FORMAT } from '../config';
import { connect } from 'react-redux';
import CrossSells from '../components/CrossSells';
import { Loading } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import Feather from 'react-native-vector-icons/Feather';
import CouponIcon from '../assets/images/Coupon';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import i18n, { rtl } from '../i18n/config';
import ShoppingBasketIcon from '../assets/images/ShoppingBasket';
import DeliveryIcon from '../assets/images/Delivery';
import { NavigationEvents } from 'react-navigation';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

modal_height = (percentage) => {
	const value = (percentage * viewportHeight) / 100;
	return Math.round(value);
};

class CartScreen extends React.Component {

	state = {
		items: this.props.cartItemsData,
		readyToCheckout: true,
		coupon: null,
		coupons: this.props.coupons,
		updatingCart: false,
		modalVisible: false,
		modalData: null,
		showDarkBg: new Animated.Value(0),
	}

	_openModal = (modalState, data) => {
		if (modalState) {
			Animated.timing(this.state.showDarkBg, { toValue: .6, duration: 500, useNativeDriver: true, }).start();
		}
		this.setState({ modalVisible: modalState, modalData: data });
	};

	componentDidUpdate = (prevProps, prevState, snapshot) => {

		if (this.state.updatingCart) {
			this._updateCart();
		}
	};

	_plusQty = (vendorId, itemID) => {
		let newitems = this.state.items;
		let didPlus = false;

		for (let i = 0; newitems[vendorId].items.length > i; i++) {
			if (newitems[vendorId].items[i].productID == itemID) {
				if (newitems[vendorId].items[i].remainingOrders > 0) {
					if (newitems[vendorId].items[i].qty < newitems[vendorId].items[i].remainingOrders) {
						newitems[vendorId].items[i].qty = parseInt(newitems[vendorId].items[i].qty) + 1;
						didPlus = true;
					}
				} else {
					newitems[vendorId].items[i].qty = parseInt(newitems[vendorId].items[i].qty) + 1;
					didPlus = true;
				}
				break;
			}
		}
		if (didPlus) {
			this.setState({ items: newitems, readyToCheckout: false });
		}
	};

	_minusQty = (vendorId, itemID) => {
		let newitems = this.state.items;
		let didMinus = false;

		for (let i = 0; newitems[vendorId].items.length > i; i++) {
			if (newitems[vendorId].items[i].productID == itemID) {
				if (newitems[vendorId].items[i].qty > newitems[vendorId].items[i].minQty) {
					newitems[vendorId].items[i].qty = parseInt(newitems[vendorId].items[i].qty) - 1;
					didMinus = true;
				}
				break;
			}
		}

		if (didMinus) {
			this.setState({ items: newitems, readyToCheckout: false });
		}
	};

	_trashItem = (vendorId, itemID) => {
		let items = this.state.items;
		let emptyCart = true;


		console.log("items1", items[vendorId].items);

		let products = items[vendorId].items;

		for (let i = 0; products.length > i; i++) {
			if (products[i].productID == itemID) {
				products.splice(i, 1);
				/* delete items[vendorId].items[i];

				console.log("length",items[vendorId].items.length);
				console.log("includes",items[vendorId].items.includes(undefined));

				if (items[vendorId].items.length == 0 || items[vendorId].items.includes(undefined)) {
					delete items[vendorId];
				} */
				break;
			}
		}
		console.log("items2", items);

		for (const [key, val] of Object.entries(items)) {
			if (val.items.length > 0) {
				emptyCart = false;
				break;
			}
		}

		this._openModal(!this.state.modalVisible, null);

		if (emptyCart) {
			this.props.saveCart({}, {}, [], null);
		} else {
			this.setState({ items: items, readyToCheckout: false });
		}
	};

	_updateCart = () => {
		let cart_data = this.state.items;
		/*Update cart*/
		Norsani.post('addtocart', 'norsani', { cartData: cart_data, coupons: this.state.coupons }).then((data) => {
			const returned_data = JSON.parse(data);
			const crossSells = returned_data.cross_sells;

			if (returned_data.messages.length > 0) {
				Alert.alert('Cart Errors', returned_data.messages.join(', '));
			}

			/*Save coupons*/
			let validCoupons = [];
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

			this.setState({ readyToCheckout: true, updatingCart: false, coupons: validCoupons }, () => { this.props.saveCart(returned_data.totals, cart_data, crossSells, validCoupons) });
		}).catch((error) => console.log(error));
	};

	_itemModal = (modalData) => {
		if (!modalData) {
			return false;
		}
		const vendorId = modalData.vendorid;
		const itemObj = modalData.itemobj;

		return (
			<Modal
				animationType="slide"
				transparent={true}
				visible={this.state.modalVisible}
				onRequestClose={() => {
					this._openModal(!this.state.modalVisible, null)
				}} >
				<View style={styles.modalBodyWrapper}>
					<TouchableHighlight underlayColor='transparent' onPress={() => { this._openModal(!this.state.modalVisible, null) }}>
						<View style={{
							height: itemObj.specialNotes || itemObj.variations && Object.keys(itemObj.variations).length > 0 || itemObj.promotions ? modal_height(50) : modal_height(75)
						}} />
					</TouchableHighlight>
					<View style={styles.modalBody}>
						<View style={styles.modalTitleWrapper}>
							<View style={styles.modalTitle}>
								<Text style={styles.modalTitleText}>{itemObj.name}</Text>
								<Text style={styles.remainingQty}>{i18n.t('CART_RemainingQty', { qty: i18n.toNumber(itemObj.remainingOrders, { precision: 3, strip_insignificant_zeros: true }) })}</Text>
							</View>
							<TouchableHighlight underlayColor='transparent' onPress={() => { Alert.alert(null, i18n.t('CART_RemoveItem', { name: itemObj.name }), [{ text: i18n.t('CART_Cancel') }, { text: i18n.t('CART_Remove'), onPress: () => { this._trashItem(vendorId, itemObj.productID) } }]) }}>
								<Feather name='trash-2' style={styles.singleItemTrash} />
							</TouchableHighlight>
						</View>
						{itemObj.specialNotes || itemObj.variations && Object.keys(itemObj.variations).length > 0 || itemObj.promotions ? (
							<View style={styles.cartItemDetailsWrapper}>
								<ScrollView>
									<View style={styles.itemDetailsScrollView}>
										{itemObj.specialNotes ? (
											<View style={styles.itemDetailWrapper}>
												<Text style={styles.itemDetailTitle}>{i18n.t('CART_SpecialNotes')}</Text>
												<Text style={styles.itemDetailValue}>{itemObj.specialNotes}</Text>
											</View>
										) : null}
										{itemObj.variations && Object.keys(itemObj.variations).length > 0 ? Object.keys(itemObj.variations).map((variationTitle, index) => (
											<View key={index} style={styles.itemDetailWrapper}>
												<Text style={styles.itemDetailTitle}>{variationTitle}</Text>
												<Text style={styles.itemDetailValue}>{itemObj.variations[variationTitle]}</Text>
											</View>
										)) : null}
										{itemObj.promotions ? (
											<View style={styles.itemDetailWrapper}>
												<Text style={styles.itemDetailTitle}>{i18n.t('CART_Promotions')}</Text>
												<Text style={styles.itemDetailValue}>{itemObj.promotions}</Text>
											</View>
										) : null}
									</View>
								</ScrollView>
							</View>
						) : null}

						<View style={styles.itemActionsWrapper}>

							<Text style={styles.singleItemPrice}>{i18n.toCurrency(itemObj.qty * itemObj.realPrice, APPCURRENCY_FORMAT)}</Text>

							<View style={styles.qtyActions}>

								<TouchableHighlight underlayColor='transparent' disabled={itemObj.qty == itemObj.minQty ? true : false} onPress={() => { this._minusQty(vendorId, itemObj.productID) }}>
									<Feather name='minus-square' style={styles.qtyMinus} />
								</TouchableHighlight>

								<Text style={styles.qty}>{i18n.toNumber(itemObj.qty, { precision: 3, strip_insignificant_zeros: true })}</Text>

								<TouchableHighlight underlayColor='transparent' disabled={itemObj.remainingOrders > 0 && itemObj.qty == itemObj.remainingOrders ? true : false} onPress={() => { this._plusQty(vendorId, itemObj.productID) }}>
									<Feather name='plus-square' style={styles.qtyPlus} />
								</TouchableHighlight>

							</View>

						</View>
					</View>
				</View>
			</Modal>
		)
	}

	_itemscontent = () => {
		const cart_data = [];
		if (Object.keys(this.state.items).length > 0 && Object.keys(this.props.appData).length > 0) {
			for (const [key, val] of Object.entries(this.state.items)) {
				if (val.items.length > 0) {
					let vendorData = {};
					this.props.appData.vendors.forEach(element => {
						if (element.id == key)
							vendorData = element
					});
					//const vendorData = this.props.appData.vendors[key];
					let vendorSubTotal = 0;
					cart_data.push(
						<View style={styles.singleVendorWrapper} key={key} >
							<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('Vendor', { vendorid: key }) }}>
								<View style={styles.vendorNameWrapper}>
									{vendorData.logo ? (
										<Image style={styles.vendorLogo} source={{ uri: vendorData.logo }} />
									) : null}
									<View style={styles.vendorAddressWrapper}>
										<Text style={styles.vendorName}>{vendorData.name}</Text>
										<Text style={styles.vendorAddress} numberOfLines={1}><Feather name='map-pin' style={styles.vendorAddressIcon} />  {vendorData.address}</Text>
									</View>
								</View>
							</TouchableHighlight>

							{val.items.map((item, index) => {
								vendorSubTotal = item.total > 0 ? vendorSubTotal + (item.total) : vendorSubTotal + item.price;
								return (
									<TouchableHighlight underlayColor='transparent' key={index} onPress={() => {
										this._openModal(!this.state.modalVisible, { vendorid: key, itemobj: item })
									}}>
										<View style={styles.singleItem}>
											<Image style={styles.itemImage} resizeMode='contain' source={item.imagelink ? { uri: item.imagelink } : require('../assets/images/placeholder.png')} />
											<Text style={styles.itemTitle} numberOfLines={1}>{item.name}  <Feather name='maximize-2' style={styles.singleItemViewIcon} /></Text>
											<Text style={styles.itemPrice}>{i18n.toNumber(item.qty, { precision: 3, strip_insignificant_zeros: true })} X {i18n.toCurrency(item.realPrice, { unit: APPCURRENCY, format: '%n%u', separator: "," })}</Text>
										</View>
									</TouchableHighlight>
								)
							})
							}
							<View style={styles.vendorTotal}>
								<Text style={styles.vendorTotalText}>{i18n.t('CART_Total')}</Text>
								<Text style={styles.vendorTotalValue}> {i18n.toCurrency(vendorSubTotal, { unit: APPCURRENCY, format: '%n%u', separator: "," })}</Text>
							</View>
						</View>
					)
				}
			}
		} else if (Object.keys(this.state.items).length > 0 && Object.keys(this.props.appData).length == 0) {
			this.setState({ items: {} });
		}
		return cart_data;
	};

	_removeCoupon = (coupon_code) => {
		let newCoupons = this.props.coupons;

		if (newCoupons.includes(coupon_code)) {
			newCoupons = newCoupons.filter(eleme => eleme != coupon_code);
			this.setState({ updatingCart: true, coupons: newCoupons });
		}
	};

	_outputTotals = (totals) => {
		if (Object.keys(totals).length > 0) {
			const coupons = totals.coupons.map((elem, index) => (
				<View key={index} style={styles.cartTotalItem}>
					<View style={styles.cartTotalItemTitle}>
						<TouchableHighlight underlayColor='transparent' style={styles.cartRemoveCoupon} onPress={() => { this._removeCoupon(elem.code) }} >
							<Feather name='trash-2' style={styles.couponTrash} />
						</TouchableHighlight>
						<View style={styles.couponDetailWrapper}>
							<Text style={styles.cartTotalItemTitle}>{elem.name}</Text>
							{elem.free_delivery ? (
								<Text style={styles.couponFreeDelivery}>{elem.free_delivery}</Text>
							) : null}
						</View>
					</View>
					<Text style={styles.cartTotalItemValue}>{i18n.toCurrency(elem.amount, APPCURRENCY_FORMAT)}</Text>
				</View>

			));
			const fees = totals.fees.map((elem, index) => <View style={styles.cartTotalItem} key={index}><Text style={styles.cartTotalItemTitle}>{i18n.t(elem.name)}</Text><Text style={styles.cartTotalItemValue}>{i18n.toCurrency(elem.fee, APPCURRENCY_FORMAT)}</Text></View>);
			const taxes = totals.taxes.map((elem, index) => <View style={styles.cartTotalItem} key={index}><Text style={styles.cartTotalItemTitle}>{elem.name}</Text><Text style={styles.cartTotalItemValue}>{i18n.toCurrency(elem.amount, APPCURRENCY_FORMAT)}</Text></View>);
			return (
				<View style={styles.cartTotalWrapper}>
					<View style={styles.cartTotalItem}>
						<Text style={styles.cartTotalItemTitle}>{i18n.t('CART_SubTotal')}</Text>
						<View style={styles.cartTotalItemValueWrapper}>
							<Text style={styles.cartTotalItemValue}>{i18n.toCurrency(totals.sub_total, APPCURRENCY_FORMAT)}</Text>
							{totals.sub_total_info ? (
								<Text style={styles.cartTotalItemValueInfo}>{totals.sub_total_info}</Text>
							) : null}
						</View>
					</View>
					{coupons}
					{fees}
					{taxes}
					<View style={styles.cartTotalItem}>
						<Text style={styles.cartTotalItemTitle}>{i18n.t('CART_Total')}</Text>
						<View style={styles.cartTotalItemValueWrapper}>
							<Text style={styles.cartTotalItemValue}>{i18n.toCurrency(totals.total, APPCURRENCY_FORMAT)}</Text>
							{totals.total_info ? (
								<Text style={styles.cartTotalItemValueInfo}>{totals.total_info}</Text>
							) : null}
						</View>
					</View>
				</View>
			)
		}
	};

	_applyCoupon = (couponText) => {
		let newCoupons = this.props.coupons;
		const currentCoupon = couponText ? couponText : null;

		if (currentCoupon) {
			if (!newCoupons.includes(currentCoupon)) {
				newCoupons.push(currentCoupon);
				this.setState({ updatingCart: true, coupons: newCoupons });
			} else {
				Alert.alert(null, 'You already applied this coupon.');
			}
		}
	};

	checkout() {
		if (!this.props.loggedInWith) {
			this.props.navigation.navigate('Login', { from: 'checkout' })
		} else
			if (Object.keys(this.state.items).length > 1) {
				Alert.alert(i18n.t("CART_MultiVendorTitle"), i18n.t('CART_MultiVendorMsg'),
					[
						{ text: i18n.t('CART_Cancel') },
						{
							text: i18n.t('CART_Checkout'),
							onPress: () => { this.props.navigation.navigate('CheckoutTab') }
						}])
			} else
				this.props.navigation.navigate('CheckoutTab');
	}

	render() {
		const cartdata = this._itemscontent();

		if (cartdata.length > 0) {
			return (
				<View style={styles.wrapper}>

					{this._itemModal(this.state.modalData)}

					<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />

					<PageHeader navigation={this.props.navigation} title={i18n.t('CART_Cart')} />

					<ScrollView>

						<View style={styles.cartInner}>

							{this.props.orderType == 'delivery' ? (
								<View style={styles.orderTypeInfoWrapper}>
									<DeliveryIcon style={styles.orderTypeIconSVG} width={40} height={40} />
									<View style={styles.orderTypeInfo}>
										<Text style={styles.orderTypeTitle}>{i18n.t('CART_DeliveryOrderTitle')}</Text>
										<Text style={styles.orderTypeText}>{i18n.t('CART_DeliveryOrderText')}</Text>
										<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('Main', { openViewOptions: true }) }} >
											<Text style={styles.orderTypeLink}>{i18n.t('CART_ChangeViewOptions')}</Text>
										</TouchableHighlight>
									</View>
								</View>
							) : null}

							{this.props.orderType == 'pickup' ? (
								<View style={styles.orderTypeInfoWrapper}>
									<ShoppingBasketIcon style={styles.orderTypeIconSVG} width={40} height={40} />
									<View style={styles.orderTypeInfo}>
										<Text style={styles.orderTypeTitle}>{i18n.t('CART_PickupOrderTitle')}</Text>
										<Text style={styles.orderTypeText}>{i18n.t('CART_PickupOrderText')}</Text>
										<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('Main', { openViewOptions: true }) }} >
											<Text style={styles.orderTypeLink}>{i18n.t('CART_ChangeViewOptions')}</Text>
										</TouchableHighlight>
									</View>
								</View>
							) : null}

							{cartdata}

							<CrossSells navigation={this.props.navigation} />

							<KeyboardAvoidingView behavior="padding" enabled>
								<View style={styles.cartCouponWrapper}>
									<View style={styles.couponTitleWrapper}>
										<CouponIcon style={styles.couponIcon} />
										<Text style={styles.couponTitle}>{i18n.t('CART_AddCoupon')}</Text>
									</View>
									<TextInput style={styles.cartCouponInput}  placeholderTextColor="gray" placeholder={i18n.t('CART_TypeCouponCode')} holder={i18n.t('CART_TypeCouponCode')} onEndEditing={(e) => { this._applyCoupon(e.nativeEvent.text) }} />
								</View>
							</KeyboardAvoidingView>
						</View>

						{this.state.readyToCheckout ? (
							<View style={styles.cartTotalsWrapper}>{this._outputTotals(this.props.totals)}</View>
						) : null}

					</ScrollView>

					<View style={styles.actionsWrapper}>
						{this.state.readyToCheckout ? (
							<TouchableHighlight underlayColor='transparent' onPress={() => { this.checkout() }} >
								<Text style={styles.cartCheckoutBtn}>{i18n.t('CART_Checkout')}</Text>
							</TouchableHighlight>
						) : (
							<TouchableHighlight underlayColor='transparent' disabled={this.state.updatingCart ? true : false} onPress={() => { this.setState({ updatingCart: true }) }} >
								<Text style={styles.cartUpdateBtn}>{i18n.t('CART_UpdateCart')}</Text>
							</TouchableHighlight>
						)}
					</View>

					{this.state.modalVisible ? (
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

					{this.state.updatingCart ? <Loading /> : null}
				</View>
			);
		} else {
			return (
				<View style={styles.wrapper}>
					<NavigationEvents onDidFocus={() => { this.setState({ items: this.props.cartItemsData }) }} />
					<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />
					<PageHeader navigation={this.props.navigation} title={i18n.t('CART_Cart')} />
					<View style={styles.emptyWrapper}>
						<Text style={styles.emptyMessageIconWrapper}><Feather name='shopping-bag' style={styles.emptyMessageIcon} /></Text>
						<Text style={styles.emptyMessage}>{i18n.t('CART_YourCartIsEmpty')}</Text>
					</View>
				</View>
			)
		}
	}
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: '#fff',
	},
	modalBodyWrapper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingBottom: Platform.OS === "ios" ? getStatusBarHeight() : 0,
	},
	modalBody: {
		flex: 1,
		backgroundColor: MODALBODYCOLOR,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
		position: 'relative',
	},
	modalTitleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 56,
		paddingLeft: 16,
	},
	modalTitle: {
		flex: 1,
	},
	modalTitleText: {
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		textAlign: 'left',
	},
	remainingQty: {
		color: '#666',
		fontSize: 12,
		fontFamily: APPFONTREGULAR,
	},
	singleItemTrash: {
		fontSize: 24,
		color: '#1e1e1e',
		paddingRight: 16,
		paddingLeft: 16,
	},
	cartItemDetailsWrapper: {
		flex: 1,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	itemDetailsScrollView: {
		paddingLeft: 16,
		paddingRight: 16,
		paddingBottom: 16,
	},
	itemDetailWrapper: {
		display: 'flex',
		flexDirection: 'column',
		height: 48,
	},
	itemDetailTitle: {
		textTransform: 'uppercase',
		fontSize: 12,
		marginTop: 14,
		marginBottom: 4,
		fontFamily: APPFONTREGULAR,
		color: '#1e1e1e',
		textAlign: 'left',
	},
	itemDetailValue: {
		color: '#1e1e1e',
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	itemActionsWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 56,
		paddingLeft: 16,
		paddingRight: 16,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	qtyActions: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		width: '40%',
	},
	qtyPlus: {
		color: SECONDARYBUTTONSCOLOR,
		fontSize: 24,
	},
	qty: {
		flex: 1,
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		textAlign: 'center',
	},
	qtyMinus: {
		color: SECONDARYBUTTONSCOLOR,
		fontSize: 24,
	},
	singleItemPrice: {
		flex: 1,
		color: PRIMARYBUTTONCOLOR,
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	cartInner: {
		backgroundColor: '#eeeeee',
	},
	orderTypeInfoWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		padding: 16,
	},
	orderTypeInfo: {
		paddingLeft: 16,
		paddingRight: 16,
	},
	orderTypeTitle: {
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
	},
	orderTypeText: {
		color: '#1e1e1e',
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
	},
	orderTypeLink: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
	},
	singleVendorWrapper: {
		marginBottom: 16,
		marginLeft: 16,
		marginTop: 16,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	vendorNameWrapper: {
		marginRight: 16,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	vendorLogo: {
		height: 40,
		width: 40,
		marginRight: 12,
		borderRadius: 70,
		overflow: 'hidden',
	},
	vendorAddressWrapper: {
		flex: 1,
		overflow: 'hidden'
	},
	vendorName: {
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	vendorAddress: {
		color: '#666',
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		textAlign: 'left',
	},
	singleItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 48,
		marginTop: 16,
		paddingRight: 16,
		backgroundColor: '#fff',
		borderTopLeftRadius: 5,
		borderBottomLeftRadius: 5,
		overflow: 'hidden',
	},
	itemImage: {
		width: 70,
		height: '100%'
	},
	itemTitle: {
		flex: 1,
		fontFamily: APPFONTMEDIUM,
		fontSize: 16,
		marginRight: 16,
		marginLeft: 16,
		color: '#1e1e1e',
		textAlign: 'left',
	},
	singleItemViewIcon: {
		fontSize: 16,
		color: SECONDARYBUTTONSCOLOR,
	},
	itemPrice: {
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		textAlign: 'left',
	},
	vendorTotal: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 16,
		height: 56,
	},
	vendorTotalText: {
		flex: 2,
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	vendorTotalValue: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	cartCouponWrapper: {
		margin: 16,
	},
	couponTitleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	couponIcon: {
		marginRight: 16,
		width: 20,
		height: 20,
	},
	couponTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	cartCouponInput: {
		backgroundColor: '#fff',
		borderRadius: 7,
		paddingLeft: 12,
		paddingRight: 12,
		height: 56,
		color: '#1e1e1e',
		fontFamily: APPFONTREGULAR,
		fontSize: 16,
		overflow: 'hidden',
	},
	cartTotalsWrapper: {
		backgroundColor: '#fff',
		paddingTop: 16,
		paddingLeft: 16,
		paddingRight: 16,
	},
	cartTotalItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	cartTotalItemTitle: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		flex: 2,
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	couponTrash: {
		fontSize: 16,
		color: '#1e1e1e',
		paddingRight: 16,
	},
	cartTotalItemValue: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		textAlign: 'right',
	},
	cartTotalItemValueInfo: {
		fontSize: 12,
		color: PRIMARYBUTTONCOLOR,
		fontFamily: APPFONTMEDIUM,
	},
	couponFreeDelivery: {
		fontSize: 10,
		color: PRIMARYBUTTONCOLOR,
		fontFamily: APPFONTMEDIUM,
	},
	actionsWrapper: {
		backgroundColor: '#fff',
		padding: 16,
	},
	cartCheckoutBtn: {
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
		textTransform: 'capitalize',
	},
	cartUpdateBtn: {
		borderRadius: 10,
		paddingLeft: 16,
		paddingRight: 16,
		height: 40,
		paddingTop: 12,
		backgroundColor: SECONDARYBUTTONSCOLOR,
		color: SECONDARYBUTTONSTEXTCOLOR,
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
		overflow: 'hidden',
		textTransform: 'capitalize',
	},
	emptyWrapper: {
		paddingTop: 56,
		margin: 16,
		flex: 1,
	},
	emptyMessageIconWrapper: {
		textAlign: 'center',
	},
	emptyMessageIcon: {
		fontSize: 80,
		color: SECONDARYBUTTONSCOLOR,
	},
	emptyMessage: {
		fontSize: 24,
		paddingTop: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
	},
});

const mapStateToProps = state => {
	return {
		cartItemsData: state.cartItemsData,
		totals: state.cartTotals,
		coupons: state.coupons,
		appData: state.appData,
		orderType: state.orderType,
		loggedInWith: state.loggedInWith,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		saveCart: (totals, cart_data, cross_sells, coupons_data) => dispatch({ type: 'SAVECART', total: totals, cartitemsdata: cart_data, crosssells: cross_sells, coupons: coupons_data })
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(CartScreen);