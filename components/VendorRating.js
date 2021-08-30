import React from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { APPFONTMEDIUM, APPFONTREGULAR, PRIMARYBUTTONTEXTCOLOR, PRIMARYBUTTONCOLOR } from '../config';
import i18n from '../i18n/config';
import Feather from 'react-native-vector-icons/Feather';


class VendorRating extends React.Component {

	state = {
		ratingColor: new Animated.Value(parseFloat(this.props.rating)),
	}

	render() {
		const rating = this.props.rating;
		const review_count = this.props.review_count ? this.props.review_count : 2;

		if (rating < 2) {
			return false;
		}

		return (
			<View style={[this.props.style, styles.wrapper]} >
				<Animated.View style={[styles.ratingBackground, {
					opacity: this.state.ratingColor.interpolate({
						inputRange: [2, 5],
						outputRange: [.5, 1],
					})
				}]} />
				<View style={styles.vendorRatingWrapper} >
					<Text><Feather name='star' style={styles.vendorRatingIcon} /></Text>
					<Text style={styles.ratingText}>
						{i18n.toNumber(rating, { precision: 1 })}  ({i18n.toNumber(review_count, { precision: 3, strip_insignificant_zeros: true })} 
						{/* {review_count > 1 ? <Text>{i18n.t('VENDOR_Reviews')}</Text> : <Text>{i18n.t('VENDOR_Review')}</Text>} */})</Text>
				</View>
				{/* <Text style={styles.ratingText}>{i18n.toNumber(rating, { precision: 1 })}</Text> */}
			</View>
		)
	}
}


const styles = StyleSheet.create({
	wrapper: {
		width: 60,
		height: 24,
		//paddingTop: 3,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		alignContent : 'center',
		justifyContent : 'center',		
		borderTopLeftRadius: 3,
		borderBottomLeftRadius: 3,
		overflow: 'hidden',
		backgroundColor: '#fff',
	},
	ratingBackground: {
		position: 'absolute',
		left: 0,
		width: 60,
		height: 24,
		top: 0,		
		backgroundColor: PRIMARYBUTTONCOLOR		
	},
	ratingText: {
		color: PRIMARYBUTTONTEXTCOLOR,
		fontSize: 10,		
		marginLeft: 3,
		textAlign: 'center',
		flexDirection : 'row',	
		fontFamily: APPFONTMEDIUM,		
	},	
	vendorRatingWrapper: {		
		flexDirection: 'row',
	},
	vendorRatingIcon: {
		fontSize: 10,		
		color: PRIMARYBUTTONTEXTCOLOR,
	},
});

export default VendorRating;