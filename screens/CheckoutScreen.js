import React from 'react';
import { Animated, Modal, StyleSheet, Dimensions, ScrollView, View, TouchableHighlight, KeyboardAvoidingView, TimePickerAndroid, Picker, Platform, DatePickerIOS, Text, Alert, TextInput, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { Norsani } from '../Norsani';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, MODALBODYCOLOR, SECONDARYBUTTONSCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, API_URL, STRIPE_KEY, APPCURRENCY_FORMAT, GOOGLEAPIKEY } from '../config';
import { Loading } from '../components/Loading';
import Feather from 'react-native-vector-icons/Feather';
import Login from '../components/Login';
import SvgPaypal from '../assets/images/Paypal';
import SvgApplePay from '../assets/images/ApplePay';
import SvgCash from '../assets/images/Cash';
import SvgCard from '../assets/images/Card';
import SvgGPay from '../assets/images/GPay';
import SvgGPayButton from '../assets/images/GPayButton';
import SvgSofort from '../assets/images/Sofort';
import { NavigationEvents } from 'react-navigation';
import PageHeader from '../components/PageHeader';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import i18n, { rtl } from '../i18n/config';
import stripe from 'react-native-stripe-payments';
import { CreditCardInput, LiteCreditCardInput } from "react-native-credit-card-input";
import { WebView } from 'react-native-webview';
//import { PaymentRequest } from 'react-native-payments';
import { ApplePayButton, PaymentRequest } from 'react-native-payments';
import { GooglePay } from 'react-native-google-pay';
import Geocoder from 'react-native-geocoding';

let billingFormData = {};

let deliveryNote = null;
let deliveryAddress = null;
let paypalToken = null;




const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

//const PaymentRequest = PaymentRequest.PaymentRequest;

const METHOD_DATA_IOS = [
	{
		supportedMethods: ['apple-pay'],
		data: {
			merchantIdentifier: 'merchant.threemeals',
			supportedNetworks: ['visa', 'mastercard', 'amex'],
			//environment: 'TEST', // defaults to production
			countryCode: 'DE',
			currencyCode: 'EUR',
			// // uncomment this block to activate automatic Stripe tokenization.
			// // try putting your key pk_test... in here and see how the token format changes.
			paymentMethodTokenizationParameters: {
				parameters: {
					gateway: 'stripe',
					'stripe:publishableKey': STRIPE_KEY,
				},
			},
		},
	},
];


const allowedCardNetworks = ['VISA', 'MASTERCARD', 'AMEX'];
const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

const requestData = {
	cardPaymentMethod: {
		tokenizationSpecification: {
			type: 'PAYMENT_GATEWAY',
			// stripe (see Example):
			gateway: 'stripe',
			gatewayMerchantId: 'BCR2DN6TSOR5XPBV',
			stripe: {
				publishableKey: STRIPE_KEY,
				version: '2018-11-08',
			},
			// other:
			//gateway: 'example',
			//gatewayMerchantId: 'exampleGatewayMerchantId',
		},
		allowedCardNetworks,
		allowedCardAuthMethods,
	},
	transaction: {
		totalPrice: 0,
		totalPriceStatus: 'FINAL',
		currencyCode: 'EUR',
	},
	merchantName: '3 Meals',
};






const METHOD_DATA_ANDROID = [{
	supportedMethods: ['android-pay'],
	data: {
		supportedNetworks: ['visa', 'mastercard', 'amex'],
		currencyCode: 'EUR',
		environment: 'TEST', // defaults to production
		paymentMethodTokenizationParameters: {
			//tokenizationType: 'NETWORK_TOKEN',
			tokenizationType: 'GATEWAY_TOKEN',
			parameters: {
				gateway: 'stripe',
				gatewayMerchantId: 'BCR2DN6TSOR5XPBV',
				'stripe:publishableKey': STRIPE_KEY,
			},
		},
		/* paymentMethodTokenizationParameters: {
			tokenizationType: 'NETWORK_TOKEN',
			parameters: {
				publicKey: 'BOdoXP+9Aq473SnGwg3JU1aiNpsd9vH2ognq4PtDtlLGa3Kj8TPf+jaQNPyDSkh3JUhiS0KyrrlWhAgNZKHYF2Y='
			}
		} */
	}
}];

/* const DETAILS = {
	id: 'basic-example',
	displayItems: [
		{
			label: 'Movie Ticket',
			amount: { currency: 'EUR', value: '15.00' }
		}
	],
	total: {
		label: 'Merchant Name',
		amount: { currency: 'EUR', value: '15.00' }
	}
}; */


modal_height = (percentage) => {
	const value = (percentage * viewportHeight) / 100;
	return Math.round(value);
};

class CheckoutScreen extends React.Component {

	state = {
		checkoutOption: null,
		billingForm: {},
		checkoutComplete: false,
		pageLoaded: false,
		payWith: null,
		isProcessingCheckout: false,
		isPaypalSelected: false,
		isSofortSelected: false,
		ordersPrepareTime: [],
		modalVisible: false,
		modalData: null,
		showDarkBg: new Animated.Value(0),
		iosPaymentMethodsModal: true,
		preparedOrdersData: [],
		vendorData: {},
		cardData: {},
		optionsVisible: false,
		checkoutOptionName: {
			"cod": i18n.t("CHECKOUT_CashOnDelivery"),
			"applePay": "Apple Pay",
			"googlePay": i18n.t("CHECKOUT_googlePay"),
			"paypal": i18n.t("CHECKOUT_PAYPAL"),
			"sofort": i18n.t("CHECKOUT_SOFORT"),
			"card": i18n.t("CHECKOUT_CARD"),
		}
	}

	async payWithCard() {

		//console.log("totals", this.props.totals);

		if (this.state.cardData.valid == false) {
			Alert.alert("Error", "Invalid card details");
			this.setState({ isProcessingCheckout: false });
			return;
		}

		const cardDetails = {
			number: this.state.cardData.values.number,
			expMonth: parseInt(this.state.cardData.values.expiry.split("/")[0]),
			expYear: parseInt(this.state.cardData.values.expiry.split("/")[1]),
			cvc: this.state.cardData.values.cvc,
		};

		//console.log("cardDetails", cardDetails);

		//console.log("_stripeInitialized", stripe._stripeInitialized);

		stripe.setOptions({ publishingKey: STRIPE_KEY });

		/* if (stripe._stripeInitialized == false)
			return; */


		const isCardValid = stripe.isCardValid(cardDetails);

		//console.log("isCardValid", isCardValid);
		//console.log("totals", this.props.totals);


		let req = {
			name: billingFormData.billing_first_name + " " + billingFormData.billing_last_name,
			address: this.props.userLocation,
			postal_code: billingFormData.postal_code ? billingFormData.postal_code : '',
			city: billingFormData.city ? billingFormData.city : 'Berlin',
			state: billingFormData.state ? billingFormData.state : 'Brandenburg',
			country: "DE",
			amount: 100 * (i18n.toNumber(this.props.totals.total, { precision: 2, strip_insignificant_zeros: false }))
		}

		console.log("req", req);

		let response = await fetch(API_URL + "get_client_secret.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(req)
		});

		console.log("response", response)

		let json = await response.json();
		json = JSON.parse(json);

		stripe.confirmPayment(json.client_secret, cardDetails)
			.then(result => {
				// result of type PaymentResult
				console.log("confirmPayment success", result);
				this._createOrders();
				this.setState({ payWith: 'card', isProcessingCheckout: false });
			})
			.catch(err => {
				// error performing payment
				Alert.alert("Error", "Payment failed");
				this.setState({ isProcessingCheckout: false });
				console.log("confirmPayment failed", err);
			})

	}

	_onChange = (form) => {
		//console.log(form);
		if (form.valid) {
			this.setState({ cardData: form });
		}
	}

	addressTimeout = null;
	changeAddress(address) {
		
		this.setState({ deliveryAddress: address });

		if (this.addressTimeout)
			clearTimeout(this.addressTimeout);

		this.addressTimeout = setTimeout(() => {			

			Geocoder.from(address)
				.then(json => {
					var location = json.results[0].geometry.location;

					if (address && location) {

						const locationcoords = location.lat+','+location.lng;

						console.log(location)
						console.log(locationcoords)
						this.props.setUserLocationOnly(address, locationcoords, false);
					}

				})

		}, 3000);



		//deliveryAddress = address;
		/* this.setState({deliveryAddress :deliveryAddress});

		Geocoder.getFromLocation(address)
			.then(json => {
				console.log("getFromLocation", json);
				const address = json.results[0].formatted_address;
				if (address && this.locationSearchInputRef) {
					this.locationSearchInputRef.setAddressText(address);						
					this.setState({loadingLocation: false, locationDetected: false}, () => {													
						this.props.setUserLocationOnly(address, locationcoords, false);
					});
				}
			}) */
	}

	componentDidMount = () => {
		Geocoder.init(GOOGLEAPIKEY);
		this.setState({ deliveryAddress: this.props.userLocation });
		//deliveryAddress = 'test';//this.props.userLocation;
	}


	componentDidUpdate = (prevProps, prevState) => {
		if (this.state.payWith != null && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length == 0) {
			/*This is the first step when creating the order*/
			this._prepareOrders();
		}

		if (this.state.payWith == 'COD' && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length > 0) {
			/*Process Cash on Delivery payment*/
			this._payCOD();
		}
		else if (this.state.payWith == 'googlePay' && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length > 0) {
			this._payWithGoogle();
		}
		else if (this.state.payWith == 'applePay' && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length > 0) {
			this.payWithApple();
		}
		else if (this.state.payWith == 'card' && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length > 0) {
			this.payWithCard();
		}
	};

	_loadPage = () => {
		let cart_data = this.props.cartItemsData;

		/*Add to cart*/
		Norsani.post('getcheckoutform', 'norsani', { cartData: cart_data, coupons: this.props.coupons, orderType: this.props.orderType }).then((data) => {

			//console.log("getcheckoutform", data);

			const returned_data = JSON.parse(data);

			this.setState({
				vendorData: {
					name: returned_data.checkout_data[0].name,
					address: returned_data.checkout_data[0].address,
					address_geo: returned_data.checkout_data[0].address_geo,
					isDeliveryAllowed: returned_data.checkout_data[0].accepted_order_type.delivery ? true : false,
					isPickupAllowed: returned_data.checkout_data[0].accepted_order_type['pickup'] ? true : false,
				}
			})

			//console.log("vendorData", this.state.vendorData);

			if (returned_data.messages.length > 0) {
				Alert.alert('Checkout Errors', returned_data.messages.join(', '));
			}

			/*Save Braintree token if any*/
			if (returned_data.braintree_token) {
				paypalToken = returned_data.braintree_token;
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

			this.setState({ billingForm: returned_data.billing_form }, () => this.props.saveCheckoutData(returned_data.totals, cart_data, returned_data.checkout_data, validCoupons));

		}).catch((error) => console.log(error))
	};

	_openModal = (modalState, data) => {

		if (modalState) {
			Animated.timing(this.state.showDarkBg, { toValue: .6, duration: 500, useNativeDriver: true, }).start();
		}
		this.setState({ modalVisible: modalState, modalData: data });
	};

	_orderScheduleModal = (modalData) => {
		if (!modalData) {
			return false;
		}

		const vendorID = modalData.vendor;

		let order_date_values = timeData = [];
		const checkout_data = this.props.checkoutData.find(elem => elem.vendor_id == vendorID);
		const order_time_data = checkout_data.timing_options ? checkout_data.timing_options : null;


		let minIOSDate = new Date();

		if (order_time_data) {
			timeData = order_time_data.minimum_time.split(':');
			var today = new Date();
			minIOSDate = new Date(today.getFullYear(), parseInt(today.getMonth() + 1), today.getDate(), timeData[0], timeData[1]);
			for (const [dateval, datelabel] of Object.entries(order_time_data.dates)) {
				order_date_values.push(<Picker.Item key={dateval} label={datelabel} value={dateval} />);
			}
		}

		let vendorOptions = this.state.ordersPrepareTime.find(elem => elem.vendor_id == vendorID);
		let deliveryTime = '';
		if (vendorOptions && vendorOptions.time) {
			let timeData = vendorOptions.time.split(":");
			deliveryTime = new Date(today.getFullYear(), parseInt(today.getMonth() + 1), today.getDate(), timeData[0], timeData[1]);
		}

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
						<View style={styles.separator} />
					</TouchableHighlight>
					<View style={styles.modalBody}>

						<Text style={styles.modalTitleText}>{i18n.t('CHECKOUT_SchedulePreparation')}</Text>

						<View style={styles.modalOptionsWrapper}>
							{Platform.OS === 'android' ? (
								<TouchableHighlight underlayColor='transparent' onPress={async () => {
									timeData = vendorOptions && vendorOptions.time ? vendorOptions.time.split(':') : timeData;
									try {
										const { action, hour, minute } = await TimePickerAndroid.open({
											hour: parseInt(timeData[0]),
											minute: parseInt(timeData[1]),
											is24Hour: false,
										});
										if (action !== TimePickerAndroid.dismissedAction) {
											const getVendorData = this.state.ordersPrepareTime.find(elem => elem.vendor_id == vendorID);
											let newVendorsOrdersTime = [];
											if (getVendorData) {
												const oldData = this.state.ordersPrepareTime.filter(elem => elem.vendor_id != vendorID);
												getVendorData.time = hour + ':' + minute;
												newVendorsOrdersTime = [...oldData, getVendorData];
											} else {
												newVendorsOrdersTime = [{ vendor_id: vendorID, time: hour + ':' + minute, date: Object.values(order_time_data.dates)[0] }];
											}

											console.log("newVendorsOrdersTime", newVendorsOrdersTime);
											this.setState({ ordersPrepareTime: newVendorsOrdersTime });
										}
									} catch ({ code, message }) {
										Alert.alert(null, i18n.t('CHECKOUT_CannotOpenTimePicker'));
									}
								}} >
									<View style={styles.modalSingleOption}>
										<Text><Feather name='watch' style={styles.modalOptionIcon} /></Text>
										<View style={styles.modalOptionValueWrapper}>
											{vendorOptions && vendorOptions.time ? (
												<Text style={styles.modalOptionValue}>{vendorOptions.time}</Text>
											) : (
												<Text style={styles.modalOptionValue}>{order_time_data.minimum_time}</Text>
											)}
											<Text style={styles.modalOptionBtn}>{i18n.t('CHECKOUT_Change')}</Text>
										</View>
									</View>
								</TouchableHighlight>
							) : (
								<View style={styles.modalSingleOption}>
									<Text><Feather name='watch' style={styles.modalOptionIcon} /></Text>
									<DatePickerIOS
										style={styles.modalOptionPicker}
										date={vendorOptions ? deliveryTime : minIOSDate}
										onDateChange={(newDate) => {

											const getVendorData = this.state.ordersPrepareTime.find(elem => elem.vendor_id == vendorID);
											let newVendorsOrdersTime = [];
											if (getVendorData) {
												const oldData = this.state.ordersPrepareTime.filter(elem => elem.vendor_id != vendorID);
												getVendorData.time = newDate.getHours() + ':' + newDate.getMinutes();
												newVendorsOrdersTime = [...oldData, getVendorData];
											} else {
												newVendorsOrdersTime = [{ vendor_id: vendorID, time: newDate.getHours() + ':' + newDate.getMinutes(), date: Object.values(order_time_data.dates)[0] }];
											}

											console.log("newVendorsOrdersTime", newVendorsOrdersTime);
											this.setState({ ordersPrepareTime: newVendorsOrdersTime });
										}
										}
										mode='time'
										minimumDate={minIOSDate}
									/>
								</View>

							)}
							<View style={styles.modalSingleOption} >
								<Text><Feather name='calendar' style={styles.modalOptionIcon} /></Text>
								<Picker
									style={styles.modalOptionPicker}
									selectedValue={vendorOptions ? vendorOptions.date : null}
									onValueChange={(itemValue, itemIndex) => {
										const getVendorData = this.state.ordersPrepareTime.find(elem => elem.vendor_id == vendorID);
										let newVendorsOrdersTime = [];
										if (getVendorData) {
											const oldData = this.state.ordersPrepareTime.filter(elem => elem.vendor_id != vendorID);
											getVendorData.date = itemValue;
											newVendorsOrdersTime = [...oldData, getVendorData];
										} else {
											newVendorsOrdersTime = [{ vendor_id: vendorID, date: itemValue, time: order_time_data.minimum_time }];
										}
										this.setState({ ordersPrepareTime: newVendorsOrdersTime });
									}}>
									{order_date_values}
								</Picker>
							</View>
						</View>
					</View>
				</View>
			</Modal>
		)
	}

	_itemscontent = () => {
		const cart_data = [];
		if (this.props.checkoutData.length == 0) {
			return false;
		}

		for (const [key, val] of Object.entries(this.props.cartItemsData)) {
			let vendorSubTotal = 0;
			val.items.map((item, index) => {
				vendorSubTotal = item.total > 0 ? vendorSubTotal + (item.total) : vendorSubTotal + item.price;
			});
			//const vendorData = this.props.appData.vendors[key];
			let vendorData = {};
			this.props.appData.vendors.forEach(element => {
				if (element.id == key)
					vendorData = element
			});
			const checkout_data = this.props.checkoutData.find(elem => elem.vendor_id == key);
			const order_time_data = checkout_data.timing_options ? checkout_data.timing_options : null;
			const vendorOptions = this.state.ordersPrepareTime.find(elem => elem.vendor_id == key);

			cart_data.push(
				<View key={key} style={styles.singleVendor}>
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('Vendor', { vendorid: key }) }}>
						<View style={styles.vendorNameWrapper}>
							{vendorData.logo ? (
								<Image style={styles.vendorLogo} source={{ uri: vendorData.logo }} />
							) : null}
							<View style={styles.vendorAddressWrapper}>
								<Text style={styles.vendorName}>{vendorData.name}</Text>
								<Text style={styles.vendorAddress} numberOfLines={1}>{vendorData.address}</Text>
							</View>
						</View>
					</TouchableHighlight>

					<View style={styles.itemsTotalWrapper}>
						<Text style={styles.itemsTotalTitle} >{val.items.length} {val.items.length > 1 ? <Text>{i18n.t('CHECKOUT_Items')}</Text> : <Text>{i18n.t('CHECKOUT_Item')}</Text>}</Text>

						<View style={styles.itemsTotalValueWrapper}>
							<Text style={styles.itemsTotalValue} >{i18n.toCurrency(vendorSubTotal, APPCURRENCY_FORMAT)}</Text>
							{parseFloat(checkout_data.total_delivery) > 0 ? (
								<Text style={styles.itemsTotalSubValue}>+ {i18n.toCurrency(parseFloat(checkout_data.total_delivery), APPCURRENCY_FORMAT)} {i18n.t('CHECKOUT_DeliveryFee')}</Text>
							) : null}
							{checkout_data.total_delivery != 'N/A' && parseFloat(checkout_data.total_delivery) == 0 || checkout_data.total_delivery != 'N/A' && !parseFloat(checkout_data.total_delivery) ? (
								<Text style={styles.itemsTotalSubValue}>{checkout_data.total_delivery}</Text>
							) : null}

						</View>

					</View>

					{order_time_data ? (
						<View style={styles.orderPrepareDateWrapper} >
							<View style={styles.orderPrepareTitleWrapper}>
								{checkout_data.timing_options.time_instructions.length > 0 ? (
									<TouchableHighlight underlayColor='transparent' onPress={() => { Alert.alert(null, String(checkout_data.timing_options.time_instructions)) }}>
										<Text style={styles.orderPrepareTitle}>{i18n.t('CHECKOUT_PrepareAt')} <Feather style={styles.orderPrepareDateValueIcon} name='info' /></Text>
									</TouchableHighlight>
								) : (
									<Text style={styles.orderPrepareTitle}>{i18n.t('CHECKOUT_PrepareAt')}</Text>
								)}
							</View>
							<TouchableHighlight underlayColor='transparent' onPress={() => { this._openModal(!this.state.modalVisible, { vendor: key }) }}>
								<View style={styles.orderPrepareDate}>
									<Text><Feather style={styles.orderPrepareDateValueIcon} name='edit' /></Text>
									<Text style={styles.orderPrepareDateValue}>{vendorOptions ? vendorOptions.time : order_time_data.minimum_time}, {vendorOptions ? vendorOptions.date : Object.values(order_time_data.dates)[0]}</Text>
								</View>
							</TouchableHighlight>
						</View>
					) : null}
				</View>
			)
		}
		return cart_data;
	};

	_payCOD = () => {
		/*Since this is a cash on delivery payment and no online payment needs handling, we directly process with creating the order.*/
		this._createOrders();
	};

	setBillingInput = (key, value) => {
		billingFormData[key] = value;
	};


	getDetails() {
		const totalAmount = i18n.toNumber(this.props.totals.total, { precision: 2, strip_insignificant_zeros: false });

		let displayItems = [];

		const cart_data = this.props.cartItemsData;

		let items = cart_data[Object.keys(cart_data)[0]].items;

		items.forEach(element => {
			displayItems.push({
				label: element.name,
				amount: { currency: 'EUR', value: element.price }
			})
		});

		let merchantName = '3Meals';

		/* this.props.appData.vendors.forEach(element => {
			if (element.id == Object.keys(cart_data)[0])
				merchantName = element.name
		}); */


		const DETAILS = {
			id: '3Meals',
			displayItems: displayItems,
			total: {
				label: merchantName,
				amount: { currency: 'EUR', value: totalAmount }
			}
		};

		return DETAILS;
	}


	_payWithGoogle = () => {

		requestData.transaction.totalPrice = i18n.toNumber(this.props.totals.total, { precision: 2, strip_insignificant_zeros: false });

		// Set the environment before the payment request
		GooglePay.setEnvironment(GooglePay.ENVIRONMENT_PRODUCTION);

		// Check if Google Pay is available
		GooglePay.isReadyToPay(allowedCardNetworks, allowedCardAuthMethods)
			.then((ready) => {
				if (ready) {
					// Request payment token
					GooglePay.requestPayment(requestData)
						.then((data) => {
							// Send a token to your payment gateway
							console.log("data", data);
							data = JSON.parse(data);
							const token = data.id;
							this.chargeToken(token);
							this._createOrders();
							this.setState({ payWith: 'googlePay', isProcessingCheckout: false });
						})
						.catch((error) => {
							this.setState({ payWith: 'googlePay', isProcessingCheckout: false });
							console.log(error.code, error.message)
						});
				}
			})

		/* const paymentRequest = new PaymentRequest(METHOD_DATA_ANDROID, this.getDetails());
		paymentRequest.canMakePayments().then((canMakePayment) => {
			if (canMakePayment) {
				console.log('Can Make Payment');

				paymentRequest.show()
					.then(paymentResponse => {
						// Your payment processing code goes here
						this._createOrders()
						this.setState({ payWith: 'googlePay', isProcessingCheckout: false });
						paymentResponse.complete('success');
					})
					.catch((error) => {

						this.setState({ payWith: 'googlePay', isProcessingCheckout: false });
						console.log("Show Error", error);

					})
			} else {
				this.setState({ payWith: 'googlePay', isProcessingCheckout: false });
				console.log('Cant Make Payment');
			}
		}); */
	};

	payWithApple = (succeed = true) => {

		const paymentRequest = new PaymentRequest(METHOD_DATA_IOS, this.getDetails());
		paymentRequest.show().then(paymentResponse => {

			const card_token = paymentResponse.details.paymentToken;

			if (succeed) {
				this.chargeToken(card_token);
				this._createOrders();
				this.setState({ payWith: 'applePay', isProcessingCheckout: false });
				paymentResponse.complete('success');

				this.debug(`Payment request completed with card token ${card_token}`);
			} else {
				this.setState({ payWith: 'applePay', isProcessingCheckout: false });
				paymentResponse.complete('failure');
				this.debug('Payment request failed');
			}
		}).catch(error => {
			this.setState({ payWith: 'applePay', isProcessingCheckout: false });
			if (error.message === 'AbortError') {
				this.debug('Payment request was dismissed');
			}
		});
	};

	async chargeToken(card_token) {
		const totalAmount = i18n.toNumber(this.props.totals.total, { precision: 2, strip_insignificant_zeros: false });
		let req = {
			order_id: this.state.preparedOrdersData[0].id,
			stripeToken: card_token,
			amount: totalAmount
		}

		console.log("req", req);

		let response = await fetch(API_URL + "chargeStripeToken.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(req)
		});

		let json = await response.json();
		json = JSON.parse(json);
		console.log("response", json)
	}

	_prepareOrders = async () => {
		const user_location = this.props.orderType == 'delivery' ? this.props.userLocation : null;
		const user_location_geo = this.props.orderType == 'delivery' ? this.props.userLocationCoords : null;
		const cart_data = this.props.cartItemsData;
		const billingFormFields = this.state.billingForm;
		let ordersCreated = [];

		/*First vaidate the billing form*/
		for (const [key, val] of Object.entries(billingFormFields)) {
			if (!billingFormData[key] && key != 'billing_country' && key != 'billing_houseno') {
				Alert.alert(i18n.t('Error'), i18n.t('CHECKOUT_MissingRequiredField', { field: val.label }));
				this.setState({ isProcessingCheckout: false });
				return false;
			}
		}
		/*Check if user has provided a valid email address*/
		const emailCheckEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!emailCheckEx.test(billingFormData.billing_email)) {
			Alert.alert(i18n.t('Error'), i18n.t('CHECKOUT_EnterValidEmail'));
			this.setState({ isProcessingCheckout: false });
			return false;
		}

		/*Billing form is ok, lets process*/
		Promise.all([
			await Norsani.post('verifycheckout', 'norsani', { cartData: cart_data, orderType: this.props.orderType, ordertimings: this.state.ordersPrepareTime, coupons: this.props.coupons, billingForm: billingFormData, paymentMethod: this.state.payWith, customerNote: deliveryNote, userLocation: user_location, userLocationGeo: user_location_geo }).then(async (data) => {
				const returned_data = JSON.parse(data);

				if (returned_data.messages && returned_data.messages.length > 0) {
					Alert.alert(i18n.t('CHECKOUT_CheckoutNotDone'), returned_data.messages.join(', '));
					return false;
				}

				console.log("checkout returned_data", returned_data)

				/*Check if login is required for checkout first create an account for the user*/
				if (this.props.checkoutData.login_required) {

					var customerInfo = {
						email: billingFormData.billing_email,
						first_name: billingFormData.billing_first_name,
						last_name: billingFormData.billing_last_name,
					};

					await Norsani.post('customers', 'wc', customerInfo).then(async (data) => {
						/*Create order*/
						await Norsani.post('orders/batch', 'wc', returned_data).then((data) => {
							if (data.create && data.create.length > 0) {
								/*Order was created*/
								ordersCreated = data.create.map(singleOrder => ({ id: singleOrder.id, status: 'processing', set_paid: true }));
							}
						}).catch(error => { Alert.alert(i18n.t('Error'), i18n.t('CHECKOUT_SomethingWentWrong')); console.log(error) });
					}).catch(error => { Alert.alert(i18n.t('Error'), i18n.t('CHECKOUT_SomethingWentWrong')); console.log(error) });

				} else {

					/*Create order*/
					await Norsani.post('orders/batch', 'wc', returned_data).then((data) => {
						console.log('orders/batch2', data);
						if (data.create && data.create.length > 0) {
							/*Order was created*/
							ordersCreated = data.create.map(singleOrder => ({ id: singleOrder.id, status: 'processing', set_paid: true }));
						}
					}).catch(error => { Alert.alert(i18n.t('Error'), i18n.t('CHECKOUT_SomethingWentWrong')); console.log(error) });
				}

			}).catch(error => { Alert.alert(i18n.t('Error'), i18n.t('CouldNotConnectToServer')); console.log(error) })

		]).then(() => {

			if (ordersCreated.length > 0) {

				console.log("ordersCreated", ordersCreated)
				this.setState({ preparedOrdersData: ordersCreated });

				if (this.state.payWith == 'paypal' && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length > 0) {
					this.setState({ isPaypalSelected: true });
					this.props.setPaypalStatus(true);
				}
				if (this.state.payWith == 'sofort' && !this.state.checkoutComplete && this.state.isProcessingCheckout && this.state.preparedOrdersData.length > 0) {
					this.setState({ isSofortSelected: true });
					this.props.setPaypalStatus(true);
				}

			} else {

				this.setState({ payWith: null, isProcessingCheckout: false });
			}
		});
	};

	_createOrders = () => {

		if (this.state.preparedOrdersData.length == 0) {
			return false;
		}

		/*This is the final step of checkout process*/
		Norsani.post('orders/batch', 'wc', { update: this.state.preparedOrdersData }).then((data) => {
			console.log('orders/batch3', data);
			if (data.update && data.update.length > 0) {
				this.assignOrder(data.update[0].id, data.update[0].meta_data[0].value)
				this.setState({ checkoutComplete: true, isProcessingCheckout: false }, () => {
					this.props.saveCart();

					const customerData = {
						name: billingFormData.billing_first_name + " " + billingFormData.billing_last_name,
						address: this.props.userLocation,
						address_geo: this.props.userLocationCoords,
					};

					setTimeout(() => {
						//this.props.navigation.navigate('Main', { openOrderCompleteModal: true, customerData: customerData, vendorData: this.state.vendorData }) 
						this.props.navigation.navigate('Order', { orderid: data.update[0].id, openOrderCompleteModal: true })
					}, 500);
				});
			}
		}).catch(error => { Alert.alert(i18n.t('Error'), i18n.t('CHECKOUT_OrderNotCompleted')); console.log(error) });

	}


	async assignOrder(order_id, vendor_id) {

		let data = {
			order_id: order_id,
			vendor_id: vendor_id
		}

		console.log("assignOrder request", data);

		let response = await fetch(API_URL + "driverAPI/assign_driver_to_order_auto.php", {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		let json = await response.json();
		console.log("assignOrder response", json);

	}

	handleWebViewNavigationStateChange = (newNavState) => {
		// newNavState looks something like this:
		// {
		//   url?: string;
		//   title?: string;
		//   loading?: boolean;
		//   canGoBack?: boolean;
		//   canGoForward?: boolean;
		// }


		const { url } = newNavState;

		if (!url) return;

		console.log("url", url);

		// one way to handle a successful form submit is via query strings
		if (url.includes('paypal_cancel.php') || url.includes('payment_cancel.php')) {
			// this.webview.stopLoading();
			this.setState({ isSofortSelected: false, isPaypalSelected: false, isProcessingCheckout: false });
			this.props.setPaypalStatus(false);
		}

		if (url.includes('paypal_success.php')) {
			//this.webview.stopLoading();
			this.setState({ payWith: 'Paypal', isPaypalSelected: false, isProcessingCheckout: false });
			this.props.setPaypalStatus(false);
			this._createOrders();
		}

		if (url.includes('payment_success_sofort.php')) {
			//this.webview.stopLoading();
			this.setState({ payWith: 'Sofort', isSofortSelected: false, isProcessingCheckout: false });
			this.props.setPaypalStatus(false);
			this._createOrders();
		}

	};

	_renderPaymentMethod = () => {
		const selectedPaymentMethod = this.state.checkoutOption;
		switch (selectedPaymentMethod) {
			case 'cod':
				return (
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.setState({ payWith: 'COD', isProcessingCheckout: true }); }}>
						<Text style={styles.createOrderBtn}>{i18n.t('CHECKOUT_CreateOrder')}</Text>
					</TouchableHighlight>
				);
			case 'googlePay':
				return (
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.setState({ payWith: 'googlePay', isProcessingCheckout: true }); }}>
						{/* <Text style={styles.createOrderBtn}>{i18n.t('CHECKOUT_CreateOrder')}</Text>	 */}
						<SvgGPayButton width={viewportWidth} height={80} />
					</TouchableHighlight>
				);
			case 'applePay':
				return (
					<ApplePayButton
						type="plain"
						style="black"
						onPress={() => { this.setState({ payWith: 'applePay', isProcessingCheckout: true }); }}
					/>
				);
			case 'paypal':
				return (
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.setState({ payWith: 'paypal', isProcessingCheckout: true }); }}>
						<Text style={styles.createOrderBtn}>{i18n.t('CHECKOUT_CreateOrder')}</Text>
					</TouchableHighlight>
				);
			case 'sofort':
				return (
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.setState({ payWith: 'sofort', isProcessingCheckout: true }); }}>
						<Text style={styles.createOrderBtn}>{i18n.t('CHECKOUT_CreateOrder')}</Text>
					</TouchableHighlight>
				);
			case 'card':
				return (
					<View>

						<CreditCardInput
							allowScroll
							cardScale={1.0}
							labelStyle={styles.label}
							inputStyle={styles.cardInput}
							inputContainerStyle={styles.inputContainerStyle}
							validColor={"black"}
							invalidColor={"red"}
							placeholderColor={"darkgray"}
							onFocus={this._onFocus}
							onChange={this._onChange} />

						<TouchableHighlight underlayColor='transparent' style={{ marginTop: 20 }} onPress={() => { this.setState({ payWith: 'card', isProcessingCheckout: true }); }}>
							<Text style={styles.createOrderBtn}>{i18n.t('CHECKOUT_CreateOrder')}</Text>
						</TouchableHighlight>
					</View>

				);
		}
	};

	_renderPaymentsOptions = () => {
		let options = [];

		/* options.push(<Picker.Item key={0} label={i18n.t("CHECKOUT_SelectPaymentMethod")} value={null} />); */

		//if (this.props.orderType == 'delivery') {
		/* options.push(<Picker.Item key={1} label={<Paypal></Paypal> + i18n.t("CHECKOUT_CashOnDelivery")} value="cod" />);
		options.push(<Picker.Item key={2} label={i18n.t("CHECKOUT_googlePay")} value="googlePay" />);
		options.push(<Picker.Item key={3} label={i18n.t("c")} value="paypal" />);
		options.push(<Picker.Item key={3} label={i18n.t("CHECKOUT_SOFORT")} value="sofort" />);
		options.push(<Picker.Item key={4} label={i18n.t("CHECKOUT_CARD")} value="card" />); */
		//}

		/* return (
			<Picker
				style={styles.paymentMethodsPicker}
				selectedValue={this.state.checkoutOption}
				onValueChange={(itemValue, itemIndex) => {
					this.setState({ checkoutOption: itemValue });
				}}>
				{options}
			</Picker>
		) */

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
						<View style={{height: viewportHeight - 400}} />
					</TouchableHighlight>
					<View style={styles.modalBody}>
						<Text style={styles.modalTitleText}>{i18n.t('CHECKOUT_SelectPaymentMethod')}</Text>

						<View style={{ flexDirection: 'row', padding: 13 }}>
							<SvgCash width={50} height={30} />
							<Text onPress={() => { this.setState({ checkoutOption: "cod" }); this.setState({ optionsVisible: !this.state.optionsVisible }) }} style={{ marginLeft: 15, fontSize: 18, color: '#000' }}>{i18n.t("CHECKOUT_CashOnDelivery")}</Text>
						</View>

						{Platform.OS == 'android' ? (
							<View style={{ flexDirection: 'row', padding: 13 }}>
								<SvgGPay width={50} height={32} />
								{/* <Image resizeMode='contain' style={{ width: 40, height: 20 }} source={require('../assets/images/google-pay.png')} /> */}
								<Text onPress={() => { this.setState({ checkoutOption: "googlePay" }); this.setState({ optionsVisible: !this.state.optionsVisible }) }} style={{ marginLeft: 15, fontSize: 18, color: '#000' }}>{i18n.t("CHECKOUT_googlePay")}</Text>
							</View>) : (
							<View style={{ flexDirection: 'row', padding: 13 }}>
								{/* <Image resizeMode='contain' style={{ width: 20, height: 20 }} source={require('../assets/images/apple_logo.png')} /> */}
								<SvgApplePay width={50} height={32} />
								<Text onPress={() => { this.setState({ checkoutOption: "applePay" }); this.setState({ optionsVisible: !this.state.optionsVisible }) }} style={{ marginLeft: 15, fontSize: 18, color: '#000' }}>Apple Pay</Text>
							</View>)}
						<View style={{ flexDirection: 'row', padding: 13 }}>
							<SvgPaypal width={50} height={32} />
							<Text onPress={() => { this.setState({ checkoutOption: "paypal" }); this.setState({ optionsVisible: !this.state.optionsVisible }) }} style={{ marginLeft: 15, fontSize: 18, color: '#000' }}>{i18n.t("CHECKOUT_PAYPAL")}</Text>
						</View>
						<View style={{ flexDirection: 'row', padding: 13 }}>
							<SvgSofort width={50} height={32} />
							<Text onPress={() => { this.setState({ checkoutOption: "sofort" }); this.setState({ optionsVisible: !this.state.optionsVisible }) }} style={{ marginLeft: 15, fontSize: 18, color: '#000' }}>{i18n.t("CHECKOUT_SOFORT")}</Text>
						</View>
						<View style={{ flexDirection: 'row', padding: 13 }}>
							<SvgCard width={50} height={32} />
							<Text onPress={() => { this.setState({ checkoutOption: "card" }); this.setState({ optionsVisible: !this.state.optionsVisible }) }} style={{ marginLeft: 15, fontSize: 18, color: '#000' }}>{i18n.t("CHECKOUT_CARD")}</Text>
						</View>

					</View>
				</View>


			</Modal>

		)
	};

	_outputTotals = (totals) => {
		if (Object.keys(totals).length > 0) {
			const coupons = totals.coupons.map((elem, index) => (
				<View key={index} style={styles.checkoutTotalItem}>
					<Text style={styles.checkoutTotalItemTitle}>{elem.name}</Text>
					<Text style={styles.checkoutTotalItemValue}>{i18n.toCurrency(elem.amount, APPCURRENCY_FORMAT)}</Text>
				</View>
			));
			const fees = totals.fees.map((elem, index) => <View style={styles.checkoutTotalItem} key={index}><Text style={styles.checkoutTotalItemTitle}>{i18n.t(elem.name)}</Text><Text style={styles.checkoutTotalItemValue}>{i18n.toCurrency(elem.fee, APPCURRENCY_FORMAT)}</Text></View>);
			const taxes = totals.taxes.map((elem, index) => <View style={styles.checkoutTotalItem} key={index}><Text style={styles.checkoutTotalItemTitle}>{elem.name}</Text><Text style={styles.checkoutTotalItemValue}>{i18n.toCurrency(elem.amount, APPCURRENCY_FORMAT)}</Text></View>);
			return (
				<View style={styles.checkoutTotalWrapper}>
					<View style={styles.checkoutTotalItem}>
						<Text style={styles.checkoutTotalItemTitle}>{i18n.t('CART_SubTotal')}</Text>
						<View style={styles.checkoutTotalItemValueWrapper}>
							<Text style={styles.checkoutTotalItemValue}>{i18n.toCurrency(totals.sub_total, APPCURRENCY_FORMAT)}</Text>
							{totals.sub_total_info ? (
								<Text style={styles.checkoutTotalItemValueInfo}>{totals.sub_total_info}</Text>
							) : null}
						</View>
					</View>
					{coupons}
					{fees}
					{taxes}
					<View style={styles.checkoutTotalItem}>
						<Text style={styles.checkoutTotalItemTitle}>{i18n.t('CART_Total')}</Text>
						<View style={styles.checkoutTotalItemValueWrapper}>
							<Text style={styles.checkoutTotalItemValue}>{i18n.toCurrency(totals.total, APPCURRENCY_FORMAT)}</Text>
							{totals.total_info ? (
								<Text style={styles.checkoutTotalItemValueInfo}>{totals.total_info}</Text>
							) : null}
						</View>
					</View>
				</View>
			)
		}
	};

	_billingForm = () => {
		const billingform = this.state.billingForm;
		let billingformOutput = [];

		if (Object.keys(billingform).length == 0) {
			return false;
		}

		for (const [key, val] of Object.entries(billingform)) {
			let keyboardtype = 'default';
			let textcontenttype = 'none';
			let defaultvalue = null;
			const userdata = this.props.currentUser.user;

			if (key == 'billing_email') {
				keyboardtype = 'email-address';
				textcontenttype = 'emailAddress';
			} else if (key == 'billing_phone') {
				keyboardtype = 'phone-pad';
				textcontenttype = 'telephoneNumber';
			}

			if (Object.keys(userdata).length > 0) {

				if (key == 'billing_email') {
					defaultvalue = userdata.email ? userdata.email : null;
					billingFormData.billing_email = userdata.email ? userdata.email : null;
					val.label = i18n.t('PLACEHOLDER_EMAIL');
				} else if (key == 'billing_first_name') {
					val.label = i18n.t('PLACEHOLDER_FIRST_NAME');
					if (key == 'billing_first_name' && userdata.givenName && userdata.givenName != 'null') {
						defaultvalue = userdata.givenName;
						billingFormData.billing_first_name = userdata.givenName;
					}
				} else if (key == 'billing_last_name') {
					val.label = i18n.t('PLACEHOLDER_LAST_NAME');
					if (key == 'billing_last_name' && userdata.familyName && userdata.familyName != 'null') {
						defaultvalue = userdata.familyName;
						billingFormData.billing_last_name = userdata.familyName;
					}
				}
				else if (key == 'billing_phone') {
					val.label = i18n.t('PLACEHOLDER_PHONE_NUMBER');
					if (userdata.phone && userdata.phone != null) {
						defaultvalue = userdata.phone;
						billingFormData.billing_phone = userdata.phone;
					}
				}
			}

			if (key != 'billing_country')
				billingformOutput.push((
					<View key={key} style={styles.formGroup}>
						<TextInput underlineColorAndroid='transparent' placeholderTextColor="gray" placeholder={val.label} style={styles.formInput} keyboardType={keyboardtype} textContentType={textcontenttype} defaultValue={defaultvalue} onEndEditing={(e) => { e.nativeEvent.text.length > 0 ? billingFormData[key] = e.nativeEvent.text : billingFormData[key] = null }} />
					</View>
				))


		}
		return billingformOutput;
	};

	render() {

		if (this.state.optionsVisible) {
			Animated.timing(this.state.showDarkBg, { toValue: .6, duration: 500, useNativeDriver: true, }).start();
		}

		const totalAmount = (i18n.toNumber(this.props.totals.total, { precision: 2, strip_insignificant_zeros: false }));

		if (this.state.isSofortSelected)
			console.log("SOFORT LINK", 'https://my.3meals.de/wp-content/plugins/norsani-api/includes/stripe_sofort.php?amount=' + (totalAmount * 100) + '&order_id=' + this.state.preparedOrdersData[0].id);

		if (Object.keys(this.state.billingForm).length == 0 || this.props.updateCheckout) {
			this._loadPage();


			return (
				<View style={styles.container}>
					<PageHeader navigation={this.props.navigation} title={i18n.t('CHECKOUT_Checkout')} />
					<Loading />
				</View>
			)
		} else if (this.props.checkoutData.login_required && !this.props.loggedInWith) {
			return (
				<View style={styles.container}>
					<PageHeader navigation={this.props.navigation} title={i18n.t('CHECKOUT_Checkout')} />
					<Login />
				</View>
			)
		}
		else if (this.state.isPaypalSelected) {
			return (
				<WebView style={{ marginTop: getStatusBarHeight() }}
					source={{
						uri: 'https://my.3meals.de/wp-content/plugins/norsani-api/includes/paypal_checkout.php?amount=' + totalAmount + '&order_id=' + this.state.preparedOrdersData[0].id,
						//uri: 'https://my.3meals.de/wp-content/plugins/norsani-api/includes/paypal_checkout.php?amount=15&order_id=283',
					}}
					sharedCookiesEnabled={true}
					onMessage={(event) => {
						console.log("onMessage", event.nativeEvent.data);
					}}
					onNavigationStateChange={this.handleWebViewNavigationStateChange}
				/>
			)
		} else if (this.state.isSofortSelected) {
			return (
				<WebView style={{ marginTop: getStatusBarHeight() }}
					source={{
						uri: 'https://my.3meals.de/wp-content/plugins/norsani-api/includes/stripe_sofort.php?amount=' + (totalAmount * 100) + '&order_id=' + this.state.preparedOrdersData[0].id,
						//uri: 'https://my.3meals.de/wp-content/plugins/norsani-api/includes/stripe_sofort.php?amount=150&order_id=283',
					}}
					sharedCookiesEnabled={true}
					onMessage={(event) => {
						console.log("onMessage", event.nativeEvent.data);
					}}
					onNavigationStateChange={this.handleWebViewNavigationStateChange}
				/>
			)
		}
		else {
			return (
				<View style={styles.container}>

					{this._orderScheduleModal(this.state.modalData)}

					<PageHeader navigation={this.props.navigation} title={i18n.t('CHECKOUT_Checkout')} />

					<ScrollView>

						{/* <KeyboardAvoidingView behavior="padding" enabled> */}

						<View style={styles.billingFormWrapper}>
							<Text style={styles.billingFormTitle}>{i18n.t('CHECKOUT_BillingDetails')}</Text>
							{this._billingForm()}
						</View>


						{this._itemscontent()}

						{this.props.orderType == 'delivery' ? (
							<View style={styles.deliveryNotesWrapper}>
								{/* <Text style={styles.deliveryNotesTitle}>{i18n.t('CHECKOUT_OrderDeliveryInfo', { info: this.props.userLocation })}</Text> */}
								<Text style={styles.deliveryNotesTitle}>{i18n.t('CHECKOUT_OrderDeliveryInfo', { info: '' })}</Text>
								<TextInput style={[styles.formInput, { height: 'auto' }]} placeholderTextColor="gray" multiline={true} value={this.state.deliveryAddress} onChangeText={text => this.changeAddress(text)}  /* onEndEditing={(e) => { this.changeAddress(e.nativeEvent.text) }} */ />
								<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('MapModal') }} >
									<Text style={styles.deliveryLink}>{i18n.t('CHECKOUT_ChangeDelivery')}</Text>
								</TouchableHighlight>
								<TextInput style={styles.deliveryNotesInput} placeholderTextColor="gray" numberOfLines={2} placeholder={i18n.t('CHECKOUT_SpecialNotesForDelivery')} onEndEditing={(e) => { deliveryNote = e.nativeEvent.text }} />
							</View>
						) : null}

						{this.state.vendorData.isPickupAllowed && this.state.vendorData.isDeliveryAllowed ? (
							<View style={{ zIndex: 9999, padding: 20, flexDirection: "row", alignItems: "center" }}>
								<TouchableOpacity onPress={() => { this.props.setOrdersType("delivery") }} style={[{ width: "50%", alignItems: "center", paddingTop: 10, paddingBottom: 10 }
									, this.props.orderType == "delivery" ? { backgroundColor: PRIMARYBUTTONCOLOR } : { backgroundColor: "#e5e5e5" }]}>
									<View >
										<Text style={[this.props.orderType == "delivery" ? { color: "#fff" } : { color: "#000" }]}>{i18n.t('ORDERTYPE_DELIVERY')}</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => { this.props.setOrdersType("pickup") }} style={[{ width: "50%", alignItems: "center", paddingTop: 10, paddingBottom: 10 }
									, this.props.orderType == "pickup" ? { backgroundColor: PRIMARYBUTTONCOLOR } : { backgroundColor: "#e5e5e5" }]}>
									<View >
										<Text style={[this.props.orderType == "pickup" ? { color: "#fff" } : { color: "#000" }]}>{i18n.t('ORDERTYPE_PICKUP')}</Text>
									</View>
								</TouchableOpacity>
							</View>
						) : null}

						{/* 	</KeyboardAvoidingView> */}

						{this._outputTotals(this.props.totals)}


						<View style={styles.paymentMethodsWrapper}>
							<View style={styles.paymentMethodsPickerWrapper}>
								<Text style={styles.paymentMethodsTitle}>{i18n.t('CHECKOUT_PaymentMethod')}</Text>

								<TouchableHighlight underlayColor='transparent' onPress={() => { this.setState({ optionsVisible: true }) }}>
									{this.state.checkoutOption ? (
										<Text style={styles.iosPickerBtn}>{this.state.checkoutOptionName[this.state.checkoutOption]}</Text>
									) : (
										<Text style={styles.iosPickerBtn}>{i18n.t('CHECKOUT_SelectPaymentMethod')}</Text>
									)}
								</TouchableHighlight>

								{this._renderPaymentsOptions()}

								{/* {Platform.OS === "ios" ? (
									<TouchableHighlight underlayColor='transparent' onPress={() => { this.setState({ iosPaymentMethodsModal: true }) }}>
										{this.state.checkoutOption ? (
											<Text style={styles.iosPickerBtn}>{this.state.checkoutOption}</Text>
										) : (
												<Text style={styles.iosPickerBtn}>{i18n.t('CHECKOUT_SelectPaymentMethod')}</Text>
											)}
									</TouchableHighlight>
								) : this._renderPaymentsOptions()} */}

							</View>

							{this._renderPaymentMethod()}
						</View>
					</ScrollView>

					{this.state.modalVisible || this.state.optionsVisible ? (
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

					{this.state.isProcessingCheckout ? <Loading /> : null}

					{/* {Platform.OS === "ios" && this.state.iosPaymentMethodsModal ? (
						<Modal visible={true} transparent={true}>
							<View style={styles.iosPaymentSelectModal}>
								<View style={styles.iosPaymentSelectModalInner}>
									{this._renderPaymentsOptions()}
									<View style={styles.dismissModalBtn}>
										<TouchableHighlight underlayColor='transparent' onPress={() => { this.setState({ iosPaymentMethodsModal: false }) }}>
											<Text style={styles.iosModalDoneText}>{i18n.t('CHECKOUT_Done')}</Text>
										</TouchableHighlight>
									</View>
								</View>
							</View>
						</Modal>
					) : null} */}
				</View>
			)
		}
	}
}

const styles = StyleSheet.create({
	container: {
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
	separator: {
		height: modal_height(55),
	},
	input: {
		borderBottomWidth: 1,
		marginLeft: 16,
		marginRight: 15,
		borderColor: 'rgba(0,0,0,0.1)'
	},
	inputContainerStyle: {
		maxWidth: 170
	},
	cardInput: {
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)'
	},
	label: {
		color: "black",
		fontSize: 12,
	},
	modalBody: {
		flex: 1,
		backgroundColor: MODALBODYCOLOR,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
		position: 'relative',
	},
	modalTitleText: {
		height: 56,
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 20,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
	},
	modalOptionsWrapper: {
		flex: 1,
		paddingBottom: 16,
	},
	modalSingleOption: {
		paddingTop: 16,
		paddingLeft: 16,
		paddingRight: 16,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	modalOptionIcon: {
		fontSize: 16,
		color: '#1e1e1e',
	},
	modalOptionValueWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 36,
	},
	modalOptionValue: {
		fontSize: 16,
		color: '#1e1e1e',
		marginLeft: 16,
		fontFamily: APPFONTMEDIUM,
	},
	modalOptionBtn: {
		flex: 1,
		textAlign: 'right',
		fontSize: 14,
		color: SECONDARYBUTTONSCOLOR,
		fontFamily: APPFONTMEDIUM,
		textTransform: 'uppercase',
	},
	modalOptionPicker: {
		width: '90%',
		padding: 0,
		marginLeft: 8,
		marginTop: 0,
		marginRight: 0,
		marginBottom: 0,
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	billingFormTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		marginLeft: 16,
		marginRight: 16,
		marginTop: 16,
	},
	formGroup: {
		marginLeft: 16,
		marginRight: 16,
		marginTop: 16,
	},
	formInput: {
		height: 56,
		color: '#1e1e1e',
		fontFamily: APPFONTREGULAR,
		fontSize: 16,
		paddingLeft: 12,
		paddingRight: 12,
		borderRadius: 7,
		backgroundColor: '#f1f1f1',
		width: '100%',
		overflow: 'hidden',
		textAlign: 'left',
	},
	deliveryNotesWrapper: {
		margin: 16,
	},
	deliveryNotesTitle: {
		color: '#1e1e1e',
		fontFamily: APPFONTREGULAR,
		fontSize: 14,
		//marginBottom: 12,
	},
	deliveryNotesInput: {
		color: '#1e1e1e',
		fontFamily: APPFONTREGULAR,
		fontSize: 16,
		paddingLeft: 12,
		paddingRight: 12,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: '#f1f1f1',
		height: 80,
		textAlignVertical: "top"
	},
	singleVendor: {
		marginLeft: 16,
		marginTop: 16,
		paddingRight: 16,
		paddingBottom: 16,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	vendorNameWrapper: {
		marginTop: 16,
		marginRight: 16,
		marginBottom: 16,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	vendorLogo: {
		height: 40,
		width: 40,
		marginRight: 12,
		borderRadius: 20,
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
	itemsTotalWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-end',
	},
	itemsTotalTitle: {
		flex: 1,
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
	},
	itemsTotalValue: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		textAlign: 'right',
	},
	itemsTotalSubValue: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 12,
		fontFamily: APPFONTREGULAR,
	},
	orderPrepareDateWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-end',
	},
	orderPrepareTitleWrapper: {
		flex: 1,
	},
	orderPrepareTitle: {
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
	},
	deliveryLink: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		marginBottom: 8
	},
	orderPrepareDate: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
	},
	orderPrepareDateValue: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		marginLeft: 8,
	},
	orderPrepareDateValueIcon: {
		color: PRIMARYBUTTONCOLOR,
		fontSize: 16,
	},
	checkoutTotalWrapper: {
		marginLeft: 16,
		paddingRight: 16,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	checkoutTotalItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 16,
	},
	checkoutTotalItemTitle: {
		flex: 2,
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
	},
	checkoutTotalItemValue: {
		color: '#1e1e1e',
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		textAlign: 'right',
	},
	checkoutTotalItemValueInfo: {
		fontSize: 12,
		color: PRIMARYBUTTONCOLOR,
		fontFamily: APPFONTMEDIUM,
	},
	paymentMethodsWrapper: {
		paddingRight: 16,
		marginLeft: 16,
		marginTop: 16,
		paddingTop: 16,
		paddingBottom: 16,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	paymentMethodsTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	paymentMethodsPicker: {
		color: SECONDARYBUTTONSCOLOR,
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		width: '100%',
		overflow: 'hidden',
	},
	createOrderBtn: {
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
	iosPaymentSelectModal: {
		display: "flex",
		backgroundColor: "rgba(0, 0, 0, 0.35)",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%"
	},
	iosPaymentSelectModalInner: {
		backgroundColor: "#fff",
		width: "80%",
		borderRadius: 7,
		overflow: 'hidden',
	},
	iosModalDoneText: {
		marginTop: 16,
		fontSize: 16,
		padding: 16,
		width: '100%',
		textAlign: 'center',
		textTransform: 'uppercase',
		color: SECONDARYBUTTONSCOLOR,
		fontFamily: APPFONTMEDIUM,
	},
	iosPickerBtn: {
		fontSize: 14,
		textTransform: 'uppercase',
		fontFamily: APPFONTMEDIUM,
		color: PRIMARYBUTTONCOLOR,
		paddingBottom: 16,
	}
});

const mapStateToProps = state => {
	return {
		checkoutData: state.checkoutData,
		cartItemsData: state.cartItemsData,
		totals: state.cartTotals,
		coupons: state.coupons,
		currentUser: state.currentUser,
		loggedInWith: state.loggedInWith,
		appData: state.appData,
		userLocation: state.userLocation,
		userLocationCoords: state.userLocationCoords,
		updateCheckout: state.updateCheckout,
		orderType: state.orderType,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		saveCheckoutData: (totals, cart_data, checkout_data, coupons_data) => dispatch({ type: 'CHECKOUTDATA', total: totals, cartitemsdata: cart_data, checkoutdata: checkout_data, coupons: coupons_data }),
		saveCart: () => dispatch({ type: 'SAVECART', coupons: [] }),
		setOrdersType: (ordertype) => dispatch({ type: 'SETORDERSTYPE', data: ordertype }),
		setPaypalStatus: (status) => dispatch({ type: 'SETPAYPALSTATUS', isPaypalOpen: status }),
		setUserLocationOnly: (currentloc, loccoords, locationClicked) => dispatch({ type: 'SETUSERLOCATIONONLY', loc: currentloc, coords: loccoords, locclicked: locationClicked })
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutScreen);