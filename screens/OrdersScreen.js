import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import { Norsani } from '../Norsani';
import { Loading } from '../components/Loading';
import Feather from 'react-native-vector-icons/Feather';
import PageHeader from '../components/PageHeader';
import i18n from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR, SECONDARYBUTTONSCOLOR, SECONDARYBUTTONSTEXTCOLOR, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, HOMEHEADINGCOLOR } from '../config';

class OrdersScreen extends React.Component {
	state = {
		ordersData: {},
		ordersCount: 20,
	}

	componentDidMount = () => {
		this._getUserOrders();
	};

	componentDidUpdate = (prevProps, prevState, snapshot) => {
		if (prevState.ordersCount < this.state.ordersCount) {
			this._getUserOrders();
		}
	};

	_getUserOrders = () => {
		const currentUser = this.props.currentUser;
		const orderscount = this.state.ordersCount;

		/*Load orders*/
		Norsani.get('getorders', 'norsani', { email: currentUser.user.email, numberorders: orderscount }).then((data) => {
			const returned_data = JSON.parse(data);
			this.setState({ ordersData: returned_data });
		}).catch((error) => console.log(error))
	};

	loadMoreOrders = () => {
		const orderscount = parseInt(this.state.ordersCount) + 20;
		this.setState({ ordersCount: orderscount });
	};

	render() {
		if (Object.keys(this.state.ordersData).length == 0) {
			return (
				<View style={styles.wrapper}>
					<PageHeader navigation={this.props.navigation} title={i18n.t('ORDERS_Orders')} />
					<Loading />
				</View>
			);
		}

		return (
			<View style={styles.wrapper}>

				<PageHeader navigation={this.props.navigation} title={i18n.t('ORDERS_Orders')} />

				{this.state.ordersData.orders && this.state.ordersData.orders.length > 0 ? (
					<ScrollView
						contentContainerStyle={styles.mainScrollView}
					>
						{
							this.state.ordersData.orders.map((order, index) => {
								let orderStatusStype = 'defaultOrderStatus';

								if (order.status == 'completed') {
									orderStatusStype = 'completedOrderStatus';
								} else if (order.status == 'processing') {
									orderStatusStype = 'processingOrderStatus';
								}

								return (
									<TouchableHighlight underlayColor='transparent' key={index} onPress={() => this.props.navigation.navigate('Order', { orderid: order.order_id })}>
										<View style={styles.orderWrapper} >
											<Text style={styles.orderTitle}>{i18n.t('ORDERS_Order')} #{order.order_id}</Text>
											<Text style={styles.orderDetails}>{order.date}</Text>
											<Text style={styles.orderDetails}>{order.details}</Text>
											<View style={[styles.orderStatus, styles[orderStatusStype]]}>
												<Text style={[styles[orderStatusStype],{backgroundColor : 'none'}]}>{order.status}</Text></View>
										</View>
									</TouchableHighlight>
								)
							})
						}
						{this.state.ordersData.count > this.state.ordersCount ? (
							<TouchableHighlight underlayColor='transparent' onPress={this.loadMoreOrders}>
								<Text style={styles.loadMore}>{i18n.t('LoadMore')}</Text>
							</TouchableHighlight>
						) : null}
					</ScrollView>
				) : (
					<View style={styles.emptyWrapper}>
						<Text style={styles.emptyMessageIconWrapper}><Feather name='shopping-bag' style={styles.emptyMessageIcon} /></Text>
						<Text style={styles.emptyMessage}>{i18n.t('ORDERS_OrdersWillBEListedHere')}</Text>
					</View>
				)}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: '#fff',
	},
	mainScrollView: {
		paddingTop: 8,
		paddingBottom: 8,
	},
	orderWrapper: {
		height: 88,
		position: 'relative',
		paddingTop: 10,
		paddingLeft: 16,
	},
	orderTitle: {
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		marginBottom: 6,
	},
	orderStatus: {
		position: 'absolute',
		right: 0,
		top: 8,
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		paddingBottom: 6,
		paddingTop: 6,
		paddingLeft: 8,
		paddingRight: 8,
		color: '#1e1e1e',
		borderTopLeftRadius: 5,
		borderBottomLeftRadius: 5,
		overflow: 'hidden',		
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
		//backgroundColor: '#DCDCDC',
	},
	orderDetails: {
		fontSize: 14,
		marginTop: 2,
		fontFamily: APPFONTREGULAR,
		color: '#666',
		textAlign: 'left',
	},
	orderDetailsIcon: {
		fontSize: 14,
		color: '#666',
	},
	loadMore: {
		borderRadius: 7,
		paddingLeft: 16,
		paddingRight: 16,
		height: 36,
		paddingTop: 8,
		margin: 16,
		backgroundColor: PRIMARYBUTTONCOLOR,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		textAlign: 'center',
		overflow: 'hidden',
	},
	emptyWrapper: {
		paddingTop: 56,
		margin: 16,
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
		currentUser: state.currentUser,
	};
};

export default connect(mapStateToProps)(OrdersScreen);