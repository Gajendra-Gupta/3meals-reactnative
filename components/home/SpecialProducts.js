import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import ListItemProduct from './ListItemProduct';
import i18n, { rtl } from '../../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../../config';

export class SpecialProducts extends React.Component {
	
	_renderItem = ({item, index}) => {
		const vendors = this.props.appData.vendors;
		const special_items = this.props.appData.special_items;
		let isFullWidth = true;
		
		for (const [key, val] of Object.entries(special_items)) {
			if (vendors[key] != undefined) {
				isFullWidth = false;
				break;
			}
		}
		
		return <ListItemProduct key={item.id} itemWidth={260} item={item} fullWidth={isFullWidth} vendor={vendors[item.author_id]} navigation={this.props.navigation} layoutStyle='simple'/>;
	}

    render () {
		const vendors = this.props.appData.vendors;
		const special_items = this.props.appData.special_items;
		let specials = [];
		
		for (const [key, val] of Object.entries(special_items)) {
			if (vendors[key] != undefined) {
				val.map(elem => {specials.push(elem)});
			}
		}
		
		if (specials.length == 0) {
			return false;
		}
		
        return (
			<View style={styles.wrapper}>
				<Text style={styles.title}>{i18n.t('SPECIALPRODUCTS')}</Text>
				<FlatList
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.contentContainer}
					data={specials}
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
		backgroundColor: '#eee'
	},
	contentContainer: {
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
	},
	title: {
		marginLeft: 16,
		marginBottom: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
	}
});