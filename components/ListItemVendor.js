import React from 'react';
import { Text, View, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import DeliveryIcon from '../assets/images/Delivery';
import DistanceIcon from '../assets/images/Distance';
import NotesIcon from '../assets/images/Notes';
import VendorRating from './VendorRating';
import i18n, { rtl } from '../i18n/config';
import { APPCURRENCY, APPCURRENCY_FORMAT, APPFONTMEDIUM, APPFONTREGULAR } from '../config';
import { connect } from 'react-redux';

class ListItemVendor extends React.Component {
	render() {
		const vendor = this.props.vendor;
		const vendor_id = this.props.vendor_id;
		const divider = this.props.distanceDivider;
		const distanceUnit = this.props.distanceUnitShortName;

		return (
			<TouchableWithoutFeedback onPress={() => {this.props.navigation.navigate('Vendor', {vendorid: vendor_id})}}>
				<View style={styles.wrapper}>
					<View style={styles.imageWrapper}>
						<Image resizeMode='cover' style={styles.vendorImage} source={vendor.cover || vendor.logo ? {uri: vendor.logo ? vendor.logo : vendor.cover} : require('../assets/images/placeholder.png')} />
					</View>
					<View style={styles.innerWrapper}>
						<View style={styles.innerContainer}>
							<View style={styles.titleWrapper}>
								<Text style={styles.vendorName} numberOfLines={1}>{ vendor.name }</Text>
								{vendor.rating > 0 ? <VendorRating style={styles.vendorRating} rating={vendor.rating} review_count={vendor.review_count}/> : null}
							</View>
							<View style={styles.tagsWrapper}>
								<Feather name='tag' style={styles.icon}/> 
								<Text style={styles.vendorClass} numberOfLines={1}>{vendor.vendorclass.join(', ')}</Text>
							</View>
							{this.props.orderType == 'delivery' && vendor.min_delivery > 0 ? (
								<View style={styles.minDeliveryWrapper}>
									<NotesIcon style={styles.minDeliveryIcon} height={15} width={15} />
									<Text style={styles.minDelivery} >{i18n.t('VENDOR_MinDeliveryOrder')} {i18n.toCurrency(vendor.min_delivery > 0 ? vendor.min_delivery : 0.0, APPCURRENCY_FORMAT)}</Text>
								</View>
							) : null}

							{!vendor.distance && vendor.distance !== 0 || vendor.distance > 0 && parseInt(vendor.distance)/divider > 60 ? (
							<View style={styles.addressWrapper}>
								<Feather name='map-pin' style={styles.icon} />
								<Text style={styles.vendoraddress} numberOfLines={1}>{vendor.address}</Text>
							</View>
							) : null}
							{vendor.distance || vendor.distance === 0 ? (
								<View style={styles.distanceMainWrapper}>
									{vendor.duration && Math.round(vendor.duration/60) < 60 || vendor.duration === 0 ? (
										<View style={styles.distanceWrapper}>
											<DeliveryIcon height={12} width={12}/>
											{vendor.custom_delivery_duration ? (
											<Text style={styles.distance}>{vendor.custom_delivery_duration}</Text>										
											) : vendor.duration === 0 ? (
											<Text style={styles.distance}>{i18n.t('FEATUREDVENDOR_FewMinutes')}</Text>
											) : (
											<Text style={styles.distance}>{Math.round(vendor.duration/60)} - {Math.round(vendor.duration/60)+10} {i18n.t('FEATUREDVENDOR_Min')}</Text>
											)}
										</View>
									) : null}
									
									{vendor.distance && parseInt(vendor.distance)/divider < 60 || vendor.distance === 0 ? (
										<View style={styles.distanceWrapper}>
											<DistanceIcon height={12} width={12}/>
											{parseInt(vendor.distance)/divider > 1 ? (
											<Text style={styles.distance}>{Math.round(vendor.distance/divider)} {distanceUnit}</Text>
											) : vendor.distance === 0 ? (
											<Text style={styles.distance}>{i18n.t('FEATUREDVENDOR_FewMetersAway')}</Text>
											) : (
											<Text style={styles.distance}>{vendor.distance} {i18n.t('FEATUREDVENDOR_Meters')}</Text>
											)}
										</View>
									) : null}
								</View>
							) : null}
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}
const styles = StyleSheet.create({
	wrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	imageWrapper: {
		width: 100,
		overflow: 'hidden',
	},
	vendorImage: {
		width: 100,
		height: 56,
		borderTopRightRadius: rtl ? 0 : 5,
		borderBottomRightRadius: rtl ? 0 : 5,
		borderTopLeftRadius: rtl ? 5 : 0,
		borderBottomLeftRadius: rtl ? 5 : 0,
		overflow: 'hidden',
	},
	innerWrapper: {
		flex: 3,
		position: 'relative',
		marginLeft: 16,
		paddingRight: 16,
		height: 88,
		borderBottomColor: 'rgba(0,0,0,0.05)',
		borderBottomWidth: 1,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center'
	},
	innerContainer: {
		width: '100%',
	},
	titleWrapper: {
		display: 'flex',
		flexDirection: 'row',
	},
	vendorName: {
		fontFamily: APPFONTMEDIUM,
		fontSize: 16,
		color: '#1e1e1e',
		flex: 1,
		textAlign: 'left',
	},
	vendorRating: {
		marginRight: -16,
	},
	tagsWrapper: {
		marginTop: 6,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	vendorClass: {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#666',
		marginRight: 16,
	},
	addressWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	vendoraddress: {
		fontSize: 14,
		marginTop: 2,
		fontFamily: APPFONTREGULAR,
		color: '#666',
		marginRight: 16,
	},
	distanceMainWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	distanceWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	distance: {
		color: '#666',
		fontSize: 14,
		marginLeft: 6,
		marginRight: 8,
	},
	icon: {
		fontSize: 12,
		marginRight: 8,
	},
	minDeliveryWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',		
	},
	minDeliveryIcon: {
		marginRight: 8,
	},
	minDelivery: {
		fontSize: 14,
		fontFamily: APPFONTREGULAR,
		color: '#666',
	},

});

const mapStateToProps = state => {
	return {
		distanceDivider: state.distanceDivider,
		distanceUnitShortName: state.distanceUnitShortName,
		orderType: state.orderType,
	};
};

export default connect(mapStateToProps)(ListItemVendor);