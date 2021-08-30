import React from 'react';
import { StyleSheet, Text, View, Platform, TouchableHighlight } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import ShoppingBasketIcon from '../assets/images/ShoppingBasket';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, PRIMARYBUTTONCOLOR, PRIMARYBUTTONTEXTCOLOR, APPCURRENCY_FORMAT, APPFONTBOLD } from '../config';
import i18n, { rtl } from '../i18n/config';

class CartBar extends React.Component {

	render() {
		if (parseFloat(this.props.total) > 0) {
			return (
				<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('QuickCart') }}>
					<View style={styles.cartBarContainer}>
						<ShoppingBasketIcon style={styles.basket} />
						<Text style={styles.cartTotal}>{i18n.toCurrency(this.props.total, APPCURRENCY_FORMAT)}</Text>

						<Text style={styles.openCartBtn} >
							<Feather name='arrow-right' style={styles.zoomIn} />
							{i18n.t("CARTBAR_Cart")}

						</Text>
					</View>
				</TouchableHighlight >
			);
		} else {
			return false;
		}
	}
}
const styles = StyleSheet.create({
	cartBarContainer: {
		...Platform.select({
			ios: {
				shadowColor: 'black',
				shadowOffset: { height: -3 },
				shadowOpacity: 0.1,
				shadowRadius: 3,
				paddingBottom: getStatusBarHeight(),
				height: 56 + getStatusBarHeight(),
			},
			android: {
				elevation: 20,
				height: 56,
			},
		}),
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: PRIMARYBUTTONCOLOR,
		paddingLeft: 16,
	},
	basket: {
		width: 24,
		paddingTop: 4,
		height: 24,
		marginRight: 32,
	},
	cartTotal: {
		flex: 2,
		paddingTop: 4,
		fontSize: 24,
		color: PRIMARYBUTTONTEXTCOLOR,
		fontFamily: APPFONTMEDIUM,
		marginRight: 16,
	},
	openCartBtn: {
		//width: 56,
		//height: 24,
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
		textAlign: 'right',
		color: 'white',
		fontSize: 24,
		fontFamily: APPFONTREGULAR,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		textAlignVertical: 'top',		

	},
	zoomIn: {
		fontSize: 24,
		color: PRIMARYBUTTONTEXTCOLOR,		
	},
});

const mapStateToProps = state => {
	return {
		total: state.cartTotals.total,
	};
};

export default connect(mapStateToProps)(CartBar);