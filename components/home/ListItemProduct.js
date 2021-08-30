import React from 'react';
import { Text, ActivityIndicator, View, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { connect } from 'react-redux';
import { APPFONTREGULAR, APPCURRENCY } from '../../config';
import i18n, { rtl } from '../../i18n/config';
import SvgTag from '../../assets/images/Tag';

class ListItemProduct extends React.Component {
		
	render() {
		const item = this.props.item;
		const vendor = this.props.vendor;
		const layoutStyle = this.props.layoutStyle;
		let price = i18n.toNumber(item.price, {precision: 3, strip_insignificant_zeros: true});
		
		if (item.is_variable) {
			const rawPrice = item.price.split('-');
			
			if (rawPrice.length > 1) {
				price = i18n.toNumber(rawPrice[0], {precision: 2, strip_insignificant_zeros: true})+' - '+i18n.toNumber(rawPrice[1], {precision: 3, strip_insignificant_zeros: true});
			} else {
				price = i18n.toNumber(rawPrice[0], {precision: 2, strip_insignificant_zeros: true});
			}
		}
		
		return (
			<TouchableWithoutFeedback onPress={() => {this.props.navigation.navigate('ProductModal', {productID: item.id})}}>
				<View style={[styles.wrapper, this.props.fullWidth == true ? styles.wrapperFullWidth : styles.wrapperNormalWidth, {width: this.props.itemWidth}]}>
					<Image resizeMode='cover' style={styles.itemImage} source={item.image ? {uri:item.image} : require('../../assets/images/placeholder.png')} />
					
					<Text style={styles.itemPrice} numberOfLines={1}>{price}{APPCURRENCY}</Text>
					
					{item.has_coupon ? (
					<View style={styles.hasCoupon}>
						<SvgTag width={24} height={24} />
					</View>
					) : null}
					
					<View style={styles.itemDetailsWrapper}>
						<Text style={styles.itemName} numberOfLines={layoutStyle != 'simple' ? 3 : 1}>{item.title}</Text>
						{layoutStyle == 'simple' ? (
							<Text style={styles.itemVendor} numberOfLines={1}>{i18n.t('LISTITEM_From')} {vendor.name}</Text>
						) : null}
						{item.categories && item.categories.length > 0 ? (
							<Text style={styles.itemCats} numberOfLines={1}><Feather name='tag' style={styles.icon}/>  {item.categories.join(', ')}</Text>
						) : null}
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}
const styles = StyleSheet.create({
	wrapper: {
		borderRadius: 7,
		overflow: 'hidden',
		position: 'relative',
		backgroundColor: '#000',
	},
	wrapperFullWidth: {
		marginLeft: rtl ? 0 : 16,
		marginRight: rtl ? 16 : 0,
	},
	wrapperNormalWidth: {
		marginLeft: rtl ? 0 : 16,
		marginRight: rtl ? 16 : 0,
	},
	itemImage: {
		height: 142,
		width: '100%',
		opacity: .7,
	},
	itemImageSimple: {
		height: 106,
		width: '35%',
	},
	itemDetailsWrapper: {
		position: 'absolute',
		bottom: 16,
		left: 16,
		width: '75%',
	},
	itemName: {
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		color: '#fff',
		width: '100%',
		textAlign: 'left',
	},
	itemVendor: {
		fontSize: 14,
		marginTop: 3,
		color: '#fff',
	},
	itemCats: {
		fontSize: 14,
		color: '#fff',
		textAlign: 'left',
	},
	itemPrice: {
		position: 'absolute',
		top: 16,
		right: 16,
		paddingLeft: 6,
		paddingRight: 6,
		paddingTop: 2,
		paddingBottom: 2,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: '#fff',
		color: '#1e1e1e',
		fontSize: 12,
		maxWidth: '70%',
	},
	icon: {
		fontSize: 12,
	},
	hasCoupon: {		
		position: 'absolute',
		top: 34,
		right: 16,
		overflow: 'hidden',
	},
});

const mapStateToProps = state => {
	return {
	};
};

export default connect(mapStateToProps)(ListItemProduct);