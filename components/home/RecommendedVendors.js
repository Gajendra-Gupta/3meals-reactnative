import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import FeaturedItemVendor from '../FeaturedItemVendor';
import i18n, { rtl } from '../../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../../config';

export class RecommendedVendors extends React.Component {
	
	_renderItem = ({item, index}) => {
		const vendors = this.props.appData.vendors;
		const vendorsID = this.props.appData.featured_vendors.filter(elem => vendors[elem] != undefined);
		const vendor = vendors[index];

		return (
			<FeaturedItemVendor key={vendor.id} itemWidth={260} fullWidth={vendorsID.length > 1 ? false : true} vendor_id={vendor.id} vendor={vendor} navigation={this.props.navigation} layoutStyle='simple' />
		);
	}

    render () {
		const vendors = this.props.appData.vendors;
		const vendorsID = this.props.appData.recommended_vendors.filter(elem => vendors[elem] != undefined);

		if (vendorsID.length == 0) {
			return false;
		}
		
        return (
			<View style={styles.wrapper}>
				<Text style={styles.title}>{i18n.t('RVENDORS_ForYou')}</Text>
				<FlatList
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.contentContainer}
					data={vendorsID}
					removeClippedSubviews={true}
					renderItem={this._renderItem}
					keyExtractor = { (item, index) => index.toString() }
					/>
			</View>
        );
    }
}
const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 16,
		paddingBottom: 16,
		marginTop: 16,
	},
	contentContainer: {
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
	},
	title: {
		marginBottom: 16,
		marginLeft: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
	}
});