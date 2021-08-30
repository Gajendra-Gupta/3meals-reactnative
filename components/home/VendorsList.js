import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import ListItemVendorFull from '../ListItemVendorFull';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../../config';
import i18n from '../../i18n/config';

export class VendorsList extends React.Component {

	_renderItem = ({item, index}) => {
		//const vendors = this.props.appData.vendors;
		const vendor = item;

		return (
			<ListItemVendorFull vendor_id={vendor.id} vendor={vendor} navigation={this.props.navigation} />
		);
	}

	render () {
		let vendors = [];
		const rawVendors = this.props.appData.vendors;
		const activeVendorType = this.props.activeVendorType;		
		const sortResultsBy = this.props.sortResultsBy;

		/* for (const [key, vendor] of Object.entries(vendors)) {
			vendorIds.push(key);
		} */
		

		rawVendors.forEach(element => {
			vendors.push(element)
		});
		

		if (vendors.length == 0) {
			return false;
		}	
		

		if (sortResultsBy == 'popularity') {
			vendors = vendors.sort((a, b) => b.orders_made - a.orders_made);
		} else if (sortResultsBy == 'distance') {
			vendors = vendors.sort((a, b) => a.distance - b.distance);
			vendors = vendors.sort((a, b) => Number(b.is_open) - Number(a.is_open));
		} else if (sortResultsBy == 'toprated') {
			vendors = vendors.sort((a, b) => b.rating - a.rating);
		} else if (sortResultsBy == 'minorderval') {
			vendors = vendors.sort((a, b) => a.min_delivery - b.min_delivery);
		}
		
		
		
		return (
			<View style={styles.wrapper}>
				{/* <Text style={styles.title}>{activeVendorType}</Text> */}
				<Text style={styles.title}>{i18n.t('HOME_ALL_VENDOR')}</Text>
				<FlatList
					contentContainerStyle={styles.contentContainer}
					data={vendors}
					initialNumToRender={5}
					renderItem={this._renderItem}
					removeClippedSubviews={true}
					keyExtractor = { (item, index) => index.toString() }
					/>
			</View>
		)
	}
}
const styles = StyleSheet.create({
	wrapper: {
		paddingBottom: 100,
		paddingTop: 8,
		backgroundColor: '#fff',
	},
	title: {
		marginTop: 8,
		marginLeft: 16,
		marginRight: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
		textAlign: 'left',
	}
});