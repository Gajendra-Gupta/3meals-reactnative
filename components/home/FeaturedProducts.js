import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import ListItemProduct from './ListItemProduct';
import DishIcon from '../../assets/images/Dish';
import i18n, { rtl } from '../../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../../config';

export class FeaturedProducts extends React.Component {
	
	_renderItem = ({item, index}) => {
		const vendors = this.props.appData.vendors;
		return <ListItemProduct itemWidth={122} item={item} vendor={vendors[item.author_id]} navigation={this.props.navigation} />;
	}
	
    render () {
		const vendors = this.props.appData.vendors;
		const ActiveVendorType = this.props.selectedVendorType;
		const featured_items = this.props.appData.featured_items.filter(elem => vendors[elem.author_id] != undefined);
		const featuredVendorsCheck = this.props.appData.featured_vendors.filter(elem => vendors[elem] != undefined);
		const recommendedVendorsCheck = this.props.appData.recommended_vendors.filter(elem => vendors[elem] != undefined);
		
		if (featured_items.length == 0) {
			return false;
		}

        return (
			<View style={[styles.wrapper, {
				backgroundColor: recommendedVendorsCheck.length > 0 || featuredVendorsCheck.length > 0 ? '#eee' : 'transparent'
			}]}>
				<View style={styles.titleWrapper}>
					<DishIcon height={24} width={24} />
					<Text style={styles.title}>{i18n.t('FEATUREDPRODUCTS')}</Text>
				</View>
				<FlatList
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.contentContainer}
					data={featured_items}
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
		paddingTop: 32,
		paddingBottom: 32,
		marginTop: 16,
	},
	contentContainer: {
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
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
	}
});