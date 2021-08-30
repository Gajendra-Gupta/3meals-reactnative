import React from 'react';
import { Text, View, StyleSheet, StatusBar, ScrollView, Image, TextInput, TouchableHighlight } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Loading } from '../components/Loading';
import ListItemProduct from '../components/ListItemProduct';
import CartBar from '../components/CartBar';
import IosStatusBar from '../components/IosStatusBar';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import i18n from '../i18n/config';
import { APPFONTMEDIUM, STATUSBARCOLOR } from '../config';

let searchTimeOut;

export default class VendorSearchScreen extends React.Component {
	state = {
		searchText: null,
		searchResults: null,
		foundResults: false,
		isSearching: false,
	};
	
	_productrow = (item) => {
		return (
			<ListItemProduct key={item.id} itemData={item} navigation={this.props.navigation}/>				
		)
	};

	_renderSearchResults = () => {
		const keyWord = this.state.searchText;
		const vendorData = this.props.navigation.getParam('vendor');
		const products = vendorData.products;
		let nameSearch = {};
		let ingredientSearch = {};
		let searchResult = [];
		
		clearTimeout(searchTimeOut);
		
		if (!keyWord || keyWord == '' || this.state.searchResults ) {
			return false;
		}
		
		searchTimeOut = setTimeout(() => {
			for(let i=0; products.length > i; i++) {
				const product = products[i];
				const productName = product.title;
				const productIng = product.ingredients.join('');
				
				const foundInName = productName.search(new RegExp(keyWord, "i"));
				const foundInIng = productIng.search(new RegExp(keyWord, "i"));
				
				if (foundInName > -1) {
					if (nameSearch[foundInName]) {
						nameSearch[foundInName].push(this._productrow(product));
					} else {
						nameSearch[foundInName] = [this._productrow(product)];
					}
				} else if (foundInIng > -1) {
					if (ingredientSearch[foundInName]) {
						ingredientSearch[foundInName].push(this._productrow(product));
					} else {
						ingredientSearch[foundInName] = [this._productrow(product)];
					}
				}
			}
			
			for (const [key, val] of Object.entries(nameSearch)) {
				if (Array.isArray(val)) {
					val.map(elem => {
						searchResult.push(elem);	
					});
				} else {
					searchResult.push(val);
				}
			}
			for (const [key, val] of Object.entries(ingredientSearch)) {
				if (Array.isArray(val)) {
					val.map(elem => {
						searchResult.push(elem);	
					});
				} else {
					searchResult.push(val);
				}
			}
			console.log(searchResult);
			this.setState({searchResults: searchResult, isSearching: false});
			
		}, 2000);
	};
	
	_saveSearchText = (search) => {
		this.setState({searchText: search, searchResults: null, isSearching: search ? true : false});
	};
	
	render() {
		const vendorName = this.props.navigation.getParam('vendorName');
		return (
			<View style={styles.container}>
				<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />
				<View style={styles.searchWrapper}>
					<TextInput style={styles.searchInput} placeholderTextColor='#1e1e1e' placeholder={i18n.t('VENDOR_SearchIns')} onChangeText={this._saveSearchText} value={this.state.searchText} autoFocus={true} />
					{this.state.searchText ? (
					<TouchableHighlight underlayColor='transparent' onPress={() => {this._saveSearchText(null)}}>
						<Feather style={styles.searchClearIcon} name='x'/>
					</TouchableHighlight>
					) : null}
				</View>
				
				{this._renderSearchResults()}
				<ScrollView>
					<Text style={styles.pageTitle}>{i18n.t('VENDOR_Searching')} {vendorName}</Text>
					{this.state.searchResults}
				</ScrollView>
				<CartBar navigation={this.props.navigation}/>
				
				{this.state.isSearching ? <Loading /> : null}
				<IosStatusBar/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	searchWrapper: {
		paddingTop: getStatusBarHeight(),
		backgroundColor: '#eeeeee',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 16,
		paddingRight: 16,
	},
	searchInput: {
		flex: 1,
		height: 56,
		paddingLeft: 12,
		paddingRight: 12,
		fontSize: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
	},
	searchClearIcon: {
		fontSize: 24,
		color: '#1e1e1e',
	},
	pageTitle: {
		padding: 16,
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
});