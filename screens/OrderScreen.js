import React from 'react';
import { Animated, ScrollView, Platform, StyleSheet, Modal, Dimensions, Text, View, Image, TouchableHighlight } from 'react-native';
import { Norsani } from '../Norsani';
import { Loading } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import Feather from 'react-native-vector-icons/Feather';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, MODALBODYCOLOR, SECONDARYBUTTONSCOLOR, SECONDARYBUTTONSTEXTCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, APPCURRENCY_FORMAT } from '../config';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { NavigationEvents } from 'react-navigation';
import i18n from '../i18n/config';
import OrderThankYou from '../components/OrderThankYou';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

modal_height = (percentage) => {
	const value = (percentage * viewportHeight) / 100;
	return Math.round(value);
};



export default class OrderScreen extends React.Component {
	state = {
		orderData: {},
		modalVisible: false,
		item: null,
		showDarkBg: new Animated.Value(0),
	}

	componentDidMount = () => {
		this._loadOrder();
	};

	_loadOrder = () => {
		const order_id = this.props.navigation.getParam('orderid');

		/*Load single order*/
		Norsani.get('getorder/' + order_id, 'norsani').then((data) => {
			const returned_data = JSON.parse(data);
			//console.log("getorder", returned_data);
			this.setState({ orderData: returned_data });
		}).catch((error) => console.log(error))
	};
	

	updateStatus = (value) => {
		console.log("updateStatus called", this.state.modalVisible);
		//if (this.state.modalVisible) {
			console.log("updateStatus called");
			let data = this.state.orderData;
			data.status = "completed";
			this.setState({ orderData: data })
		//}
	  }


	_openModal = (modalState, data) => {
		if (modalState) {
			Animated.timing(this.state.showDarkBg, { toValue: .6, duration: 500, useNativeDriver: true, }).start();
		}
		this.setState({ modalVisible: modalState, item: data });
	};

	_itemModal = (item) => {
		if (!item) {
			return false;
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

						<Text style={styles.modalTitleText} numberOfLines={1}>{item.name}</Text>

						<View style={styles.itemDetailsWrapper}>
							<ScrollView>
								<View style={styles.itemDetailsScrollView}>
									<View style={styles.itemDetailWrapper}>
										<Text style={styles.itemDetailTitle}>{i18n.t('ORDER_Quantity')}</Text>
										<Text style={styles.itemDetailValue}>{i18n.toNumber(item.qty, { precision: 3, strip_insignificant_zeros: true })}</Text>
									</View>
									<View style={styles.itemDetailWrapper}>
										<Text style={styles.itemDetailTitle}>{i18n.t('ORDER_Price')}</Text>
										<Text style={styles.itemDetailValue}>{i18n.toCurrency(item.price, APPCURRENCY_FORMAT)}</Text>
									</View>
									{Object.keys(item.meta_data).length > 0 ? Object.keys(item.meta_data).map(singleVarKey => (
										<View key={singleVarKey} style={styles.itemDetailWrapper}>
											<Text style={styles.itemDetailTitle}>{singleVarKey}</Text>
											<Text style={styles.itemDetailValue}>{item.meta_data[singleVarKey]}</Text>
										</View>
									)) : null}

									{item.discount > 0 ? (
										<View style={styles.itemDetailWrapper}>
											<Text style={styles.itemDetailTitle}>{i18n.t('ORDER_Discount')}</Text>
											<Text style={styles.itemDetailValue}>{i18n.toCurrency(item.discount, APPCURRENCY_FORMAT)}</Text>
										</View>
									) : null}

									{item.taxes && item.taxes.length > 0 ? item.taxes.map((singleTax, index) => (
										<View key={index} style={styles.itemDetailWrapper}>
											<Text style={styles.itemDetailTitle}>{singleTax.label}</Text>
											<Text style={styles.itemDetailValue}>{i18n.toCurrency(singleTax.amount, APPCURRENCY_FORMAT)}</Text>
										</View>
									)) : null}

									<View style={styles.itemDetailWrapper}>
										<Text style={styles.itemDetailTitle}>{i18n.t('ORDER_Total')}</Text>
										<Text style={styles.itemDetailValue}>{i18n.toCurrency(item.total, APPCURRENCY_FORMAT)}</Text>
									</View>

									{item.refunded > 0 ? (
										<View style={styles.itemDetailWrapper}>
											<Text style={styles.itemDetailTitle}>{i18n.t('ORDER_Refunded')}</Text>
											<Text style={styles.itemDetailValue}>{i18n.toCurrency(item.refunded, APPCURRENCY_FORMAT)}</Text>
										</View>
									) : null}
								</View>
							</ScrollView>
						</View>
					</View>
				</View>
			</Modal>
		)
	}

	render() {
		const order = this.state.orderData;
		const orderId = this.props.navigation.getParam('orderid');
		const pageTitle = i18n.t('ORDERS_Order') + ' #' + this.props.navigation.getParam('orderid');
		let orderStatusStype = 'defaultOrderStatus';

		if (this.props.navigation.getParam('openOrderCompleteModal')) {
			Animated.timing(this.state.showDarkBg, { toValue: .6, duration: 500, useNativeDriver: true, }).start();
		}

		if (order.status == 'completed') {
			orderStatusStype = 'completedOrderStatus';
		} else if (order.status == 'processing') {
			orderStatusStype = 'processingOrderStatus';
		}

		const vendorData = {
			name: order.store_name,
			address: order.address,
			address_geo: order.address_geo,
		};

		const customerData = {
			name: order.order_billing_first_name + " " + order.order_billing_last_name,
			address: order.user_del_location,
			address_geo: order.user_geo_location,
		};

		if (Object.keys(order).length == 0) {
			return (
				<View style={styles.container}>
					<PageHeader navigation={this.props.navigation} title={pageTitle} />
					<Loading />
				</View>
			);
		}

		return (
			<View style={styles.container}>

				<PageHeader navigation={this.props.navigation} title={pageTitle} />

				{this._itemModal(this.state.item)}

				<ScrollView>
					<View style={styles.vendorWrapper}>
						<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('Vendor', { vendorid: order.vendor_id }) }}>
							<View style={styles.vendorNameWrapper}>
								{order.store_logo ? (
									<Image style={styles.vendorLogo} source={{ uri: order.store_logo }} />
								) : null}
								<View style={styles.vendorAddressWrapper}>
									<Text style={styles.vendorName}>{order.store_name}</Text>
									<Text style={styles.vendorAddress} numberOfLines={1}><Feather style={styles.addressIcon} name='map-pin' />  {order.address}</Text>
									<Text style={styles.orderDate}><Feather style={styles.orderDateIcon} name='clock' />  {order.date}</Text>
								</View>
							</View>
						</TouchableHighlight>
						

						<View style={styles.orderDetails}>						

							{order.status !== 'completed' ? (
								<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.setParams({ openOrderCompleteModal: true }); }}>
									<Text style={[styles.orderStatus, styles.orderTrack]}>{i18n.t("ORDER_Track")}</Text>
								</TouchableHighlight>
							) : null}

							{order.status == 'completed' ? (
								<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('rating', { orderId: orderId, vendorid: order.vendor_id }) }}>
									<Text style={[styles.orderStatus, styles.orderTrack]}>{i18n.t("ORDER_Review")}</Text>
								</TouchableHighlight>
							) : null}
							<Text style={[styles.orderStatus, styles[orderStatusStype]]}>{order.status}</Text>
						</View>


						<View style={styles.items}>
							{order.items.map((item, index) => (
								<TouchableHighlight underlayColor='transparent' key={index} onPress={() => {
									this._openModal(!this.state.modalVisible, item)
								}}>
									<View style={styles.singleProductRow}>
										{item.imagelink ? (
											<Image style={styles.itemImg} source={{ uri: item.imagelink }} />
										) : null}
										<View style={styles.itemDetailsWrapper}>
											<Text style={styles.itemTitle}>{item.name}</Text>
											<Text style={styles.itemDetails}>{i18n.toCurrency(item.total, APPCURRENCY_FORMAT)}</Text>
											{item.refunded > 0 ? (
												<Text style={styles.itemDetails}>{i18n.t('ORDER_Refunded')}: {item.refunded}</Text>
											) : null}
										</View>
										<Text style={styles.itemViewIconWrapper}><Feather name='eye' style={styles.itemViewIcon} /></Text>
									</View>
								</TouchableHighlight>
							))}
						</View>

						<View style={styles.orderTotals}>
							<Text style={styles.orderTotalsTitle}>{i18n.t('ORDER_SubTotal')}</Text>
							<Text style={styles.orderTotalsValue}>{i18n.toCurrency(order.sub_total, APPCURRENCY_FORMAT)}</Text>
						</View>

						{order.coupons && order.coupons.length > 0 ? (
							<View style={styles.orderTotals}>
								<Text style={styles.orderTotalsTitle}>{i18n.t('ORDER_CouponsUsed')}</Text>
								<Text style={styles.orderTotalsValue}>{order.coupons.join(', ')}</Text>
							</View>
						) : null}

						{order.discount > 0 ? (
							<View style={styles.orderTotals}>
								<Text style={styles.orderTotalsTitle}>{i18n.t('ORDER_TotalDiscount')}</Text>
								<Text style={styles.orderTotalsValue}>{i18n.toCurrency(order.discount, APPCURRENCY_FORMAT)}</Text>
							</View>
						) : null}

						{order.fees && order.fees.length > 0 ?
							order.fees.map((fee, index) => (
								<View key={index} style={styles.orderTotals}>
									<Text style={styles.orderTotalsTitle}>{fee.name}</Text>
									<Text style={styles.orderTotalsValue}>{i18n.toCurrency(fee.amount, APPCURRENCY_FORMAT)}</Text>
								</View>
							))
							: null}

						{order.taxes && order.taxes.length > 0 ?
							order.taxes.map((tax, index) => (
								<View key={index} style={styles.orderTotals}>
									<Text style={styles.orderTotalsTitle}>{tax.label}</Text>
									<Text style={styles.orderTotalsValue}>{i18n.toCurrency(tax.amount, APPCURRENCY_FORMAT)}</Text>
								</View>
							))
							: null}

						<View style={styles.orderTotals}>
							<Text style={styles.orderTotalsTitle}>{i18n.t('ORDER_Payment')}</Text>
							<Text style={styles.orderTotalsValue}>{order.payment_gateway}</Text>
						</View>

						<View style={styles.orderTotals}>
							<Text style={styles.orderTotalsTitle}>{i18n.t('ORDER_Total')}</Text>
							<Text style={styles.orderTotalsValue}>{i18n.toCurrency(order.total, APPCURRENCY_FORMAT)}</Text>
						</View>


						{order.refunds && order.refunds.length > 0 ? (
							<View style={styles.orderRefund}>
								<Text style={styles.refundTitle}>{i18n.t('ORDER_Refunds')}</Text>
								{order.refunds.map((refund, index) => (
									<View key={index} style={styles.singleRefund}>
										<Text style={styles.refundDetailsValue}>{refund.details}</Text>
										<View style={styles.refundDetailsWrapper}>
											<Text style={styles.refundDetailsTitle}>{i18n.t('ORDER_Amount')}</Text>
											<Text style={styles.refundDetailsValue}>{refund.currency}{i18n.toNumber(refund.amount, { precision: 3, strip_insignificant_zeros: true })}</Text>
										</View>
										<View style={styles.refundDetailsWrapper}>
											<Text style={styles.refundDetailsTitle}>{i18n.t('ORDER_Reason')}</Text>
											<Text style={styles.refundDetailsValue}>{refund.reason}</Text>
										</View>
									</View>
								))}
							</View>
						) : null}
					</View>

					<OrderThankYou updateStatus={this.updateStatus} navigation={this.props.navigation} order_id={orderId} customerData={customerData} vendorData={vendorData} pre_time={order.order_preparation_time} show={this.props.navigation.getParam('openOrderCompleteModal')} />
				</ScrollView>


				{this.state.modalVisible || this.props.navigation.getParam('openOrderCompleteModal') ? (
					<Animated.View style={{
						backgroundColor: '#000',
						opacity: this.state.showDarkBg,
						position: 'absolute',
						left: -2,
						top: -2,
						zIndex: 100,
						height: '105%',
						width: '105%',
					}} collapsable={false} />
				) : null}
			</View>
		);
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
		height: modal_height(40),
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
	itemDetailsWrapper: {
		flex: 1,
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
		color: '#666',
	},
	itemDetailValue: {
		color: '#1e1e1e',
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
	},
	vendorNameWrapper: {
		margin: 16,
		display: 'flex',
		flexDirection: 'row',
		//alignItems: 'center',
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
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	vendorAddress: {
		color: '#666',
		marginTop: 6,
		fontFamily: APPFONTREGULAR,
		textAlign: 'left',
	},
	addressIcon: {
		fontSize: 14,
		color: '#666',
	},
	orderDetails: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent:'flex-end',
		paddingBottom: 16,
		marginLeft: 16,
		paddingRight: 16,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	orderDate: {
		flex: 1,
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#666',
		textAlign: 'left',
		marginTop : 5
	},
	orderStatus: {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		paddingBottom: 6,
		paddingTop: 6,
		borderRadius: 7,
		overflow: 'hidden',
		paddingLeft: 8,
		paddingRight: 8,
		textAlign: 'left',
		color: '#1e1e1e',
	},
	defaultOrderStatus: {
		backgroundColor: SECONDARYBUTTONSCOLOR,
		color: SECONDARYBUTTONSTEXTCOLOR,
	},
	completedOrderStatus: {
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
	},
	processingOrderStatus: {
		backgroundColor: 'rgba(0,0,0,0.05)',
	},
	orderTrack: {
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		marginRight: 10,
	},
	items: {
		paddingRight: 16,
		paddingBottom: 16,
		marginLeft: 16,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	singleProductRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 72,
		paddingTop: 16,
	},
	itemImg: {
		height: 40,
		width: 40,
		marginRight: 16,
		borderRadius: 7,
		overflow: 'hidden',
	},
	itemDetailsWrapper: {
		flex: 2,
	},
	itemTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	itemDetails: {
		fontSize: 14,
		color: '#666',
		textAlign: 'left',
		fontFamily: APPFONTREGULAR,
	},
	itemViewIconWrapper: {
		textAlign: 'right',
	},
	itemViewIcon: {
		fontSize: 24,
		color: SECONDARYBUTTONSCOLOR,
	},
	orderTotals: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 16,
		marginLeft: 16,
		marginRight: 16,
	},
	orderTotalsTitle: {
		flex: 1,
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	orderTotalsValue: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	orderRefund: {
		marginBottom: 16,
		marginLeft: 16,
		marginTop: 16,
		paddingTop: 16,
		paddingRight: 16,
		borderTopWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		backgroundColor: 'rgba(255, 0, 0, 0.09)',
	},
	refundTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	singleRefund: {
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.05)',
		paddingTop: 16,
		paddingBottom: 16,
	},
	refundDetailsWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	refundDetailsTitle: {
		flex: 1,
		textAlign: 'left',
		fontSize: 14,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	refundDetailsValue: {
		fontFamily: APPFONTREGULAR,
		fontSize: 12,
		color: '#666',
	},
});