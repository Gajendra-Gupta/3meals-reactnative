import React from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, ScrollView, Image } from 'react-native';
import i18n, { rtl } from '../../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR, APPCURRENCY, SECONDARYBUTTONSCOLOR, SECONDARYBUTTONSTEXTCOLOR } from '../../config';
import CouponIcon from '../../assets/images/Coupon';

export class Coupons extends React.Component {
	
	_coupons = (couponsData) => (
		couponsData.map((coupon, index) => (
			<TouchableWithoutFeedback key={index} onPress={() => {this.props.navigation.navigate('Vendor', {vendorid: coupon.vendor_id})}}>
				<View style={[styles.couponWrapper, {
					width: couponsData.length > 1 ? 122 : 'auto',
					marginLeft: couponsData.length > 1 && rtl ? 0 : 16,
					marginRight: rtl ? 16 : couponsData.length > 1 ? 0 : 16,
				}]}>
					<Image resizeMode='cover' style={styles.couponBg} source={coupon.vendor_cover ? {uri:coupon.vendor_cover} : require('../../assets/images/placeholder.png')} />

					<View style={styles.couponDetailsWrapper}>
						<Text style={styles.vendorName} numberOfLines={1}>{coupon.vendor_name}</Text>
						
						<View style={styles.couponTextWrapper}>
							{coupon.type == 'percent' ? (
								<Text style={styles.couponText} numberOfLines={2}>{i18n.toNumber(coupon.amount, {precision: 3, strip_insignificant_zeros: true})} {i18n.t('OFFERS_PercentOff')}</Text>
							) : (
								<Text style={styles.couponText} numberOfLines={2}>{APPCURRENCY}{i18n.toNumber(coupon.amount, {precision: 3, strip_insignificant_zeros: true})} {i18n.t('OFFERS_Off')}</Text>
							)}
						</View>
						
						<View style={styles.couponFooter}>
							{coupon.free_shipping ? (
								<Text style={styles.couponAdlText} numberOfLines={1}>{i18n.t('OFFERS_FreeDelivery')}</Text>										
							) : null}
							{coupon.ending ? (
								<Text style={styles.couponInfo} numberOfLines={2}>{coupon.ending}</Text>
							) : null}
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		))
	);
	
	render () {
		let couponsData = this.props.appData.coupons;
		const vendors = this.props.appData.vendors;
		couponsData = couponsData.filter(coupon => vendors[coupon.vendor_id] != undefined);
		
		if (couponsData.length == 0) {
			return false;
		}
		
		return (
			<View style={styles.wrapper}>
				<View style={styles.titleWrapper}>
					<CouponIcon height={24} width={24} />
					<Text style={styles.title}>{i18n.t('OFFERS')}</Text>
				</View>
				{couponsData.length == 1 ? this._coupons(couponsData) : (
				<ScrollView
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.contentContainer}
					>
					{this._coupons(couponsData)}
				</ScrollView>
				)}
			</View>
		)
	}
}
const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 16,
		paddingBottom: 16,
		marginTop: 16,
	},
	titleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		marginLeft: 16,
	},
	title: {
		marginLeft: 16,
		marginRight: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
	},
	contentContainer: {
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
	},
	couponWrapper: {
		borderRadius: 7,
		overflow: 'hidden',
		position: 'relative',
		backgroundColor: '#000',
	},
	couponBg: {
		height: 156,
		width: '100%',
		opacity: .7,
	},
	couponDetailsWrapper: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	vendorLogo: {
		width: 24,
		height: 24,
		borderRadius: 7,
		overflow: 'hidden',
	},
	vendorName: {
		textTransform: 'uppercase',
		color: '#fff',
		fontFamily: APPFONTMEDIUM,
		fontSize: 14,
		margin: 12,
	},
	couponTextWrapper: {
		borderRadius: 7,
		overflow: 'hidden',
		padding: 8,
		marginTop: 4,
		marginLeft: 12,
		marginRight: 12,
		backgroundColor: SECONDARYBUTTONSCOLOR,
	},
	couponText: {
		textAlign: 'center',
		textTransform: 'uppercase',
		color: SECONDARYBUTTONSTEXTCOLOR,
		fontFamily: APPFONTMEDIUM,
		fontSize: 16,
	},
	couponAdlText: {
		textTransform: 'uppercase',
		color: '#fff',
		fontFamily: APPFONTMEDIUM,
		fontSize: 11,
		marginTop: 10,
		textAlign: 'center',
	},
	couponInfo: {
		margin: 10,
		color: '#fff',
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
		fontSize: 12,
	},
});