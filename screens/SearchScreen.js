import React from 'react';
import { Animated, Modal, Text, Platform, StyleSheet, Dimensions, Picker, Alert, TouchableHighlight, StatusBar, ScrollView, TextInput, View } from 'react-native';
import { connect } from 'react-redux';
import ListItemVendor from '../components/ListItemVendor';
import { Norsani } from '../Norsani';
import { APPFONTMEDIUM, APPFONTREGULAR, SEARCHRESULTSSORTINGOPTIONS, MODALBODYCOLOR, HOMEHEADINGCOLOR, SEARCHRESULTSSORTINGOPTIONSICON, APPFONTBOLD, STATUSBARCOLOR } from '../config';
import { orderByDistance } from 'geolib';
import { Loading } from '../components/Loading';
import Feather from 'react-native-vector-icons/Feather';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import IosStatusBar from '../components/IosStatusBar';
import { NavigationEvents } from 'react-navigation';
import i18n, { rtl } from '../i18n/config';

let searchTimeOut, popularVendorsTimeOut, topRatedVendorsTimeOut;

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

modal_height = (percentage) => {
	const value = (percentage * viewportHeight) / 100;
	return Math.round(value);
};

class SearchScreen extends React.Component {
	state = {
		optionsVisible: false,
		searchText: null,
		searchResults: null,
		foundResults: false,
		topVendors: null,
		popularVendors: null,
		vendorType: this.props.selectedVendorType,
		orderType: this.props.userLocationSet || this.props.orderType != 'delivery' ? this.props.orderType : null,
		sortResultsBy: Object.keys(SEARCHRESULTSSORTINGOPTIONS)[0],
		isSearching: false,
		searchResultsRaw: [],
		showDarkBg: new Animated.Value(0),
	};

	_openOptions = (optionState) => {
		if (optionState) {
			Animated.timing(this.state.showDarkBg, { toValue: .6, duration: 500, useNativeDriver: true, }).start();
		}
		this.setState({ optionsVisible: optionState });
	};

	_loadPopularVendors = () => {
		clearTimeout(popularVendorsTimeOut);

		if (this.state.searchText) {
			return false;
		}

		if (this.state.popularVendors) {
			if (this.state.popularVendors.length > 1) {
				return this.state.popularVendors;
			}
			return false;
		}

		popularVendorsTimeOut = setTimeout(() => {

			const vendors_raw = this.props.appData.vendors;
			const orderType = this.state.orderType;
			let vendors = this.props.appData.vendors;
			let returned_data = [];

			if (!vendors_raw) {
				return false;
			}

			/* for (let [key, vendor] of Object.entries(vendors_raw)) {
				vendor.id = key;
				vendors.push(vendor);
			} */

			const popularVendors = vendors.sort((a, b) => b.orders_made - a.orders_made);
			for (let i = 0; i < popularVendors.length; i++) {
				if (i > 10) {
					break;
				}
				const vendor_data = popularVendors[i];
				//console.log("popularVendors", popularVendors);
				returned_data.push(<ListItemVendor key={vendor_data.id} vendor_id={vendor_data.id} vendor={vendor_data} navigation={this.props.navigation} />);
			}

			if (orderType == 'delivery') {
				returned_data.unshift(<View key={0} numberOfLines={2}><Text style={styles.listTitle}>{i18n.t('SEARCH_PopularVendorsNearYou')}</Text></View>);
			} else {
				returned_data.unshift(<View key={0} numberOfLines={2}><Text style={styles.listTitle}>{i18n.t('SEARCH_PopularVendorsIn', { locality: this.props.userLocality })}</Text></View>);
			}

			this.setState({ popularVendors: returned_data });

		}, 0);
	};

	_loadTopRatedVendors = () => {
		clearTimeout(topRatedVendorsTimeOut);

		if (this.state.searchText || !this.state.topVendors) {
			return false;
		}

		if (this.state.topVendors) {
			if (this.state.topVendors.length > 1) {
				return this.state.topVendors;
			}
			return false;
		}

		topRatedVendorsTimeOut = setTimeout(() => {

			const topVendors = this.props.appData.top_rated_vendors;
			const vendors_raw = this.props.appData.vendors;
			const orderType = this.state.orderType;
			let returned_data = [];

			if (topVendors.length > 0) {
				for (let i = 0; i < topVendors.length; i++) {
					const vendor_data = vendors_raw[topVendors[i]] ? vendors_raw[topVendors[i]] : null;
					if (vendor_data) {
						returned_data.push(<ListItemVendor key={topVendors[i]} vendor_id={topVendors[i]} vendor={vendor_data} navigation={this.props.navigation} />);
					}
				}

				if (orderType == 'delivery') {
					returned_data.unshift(<View key={0} numberOfLines={2}><Text style={styles.listTitle}>{i18n.t('SEARCH_TopRatedVendorsNearYou')}</Text></View>);
				} else {
					returned_data.unshift(<View key={0} numberOfLines={2}><Text style={styles.listTitle}>{i18n.t('SEARCH_TopRatedVendorsIn', { locality: this.props.userLocality })}</Text></View>);
				}
				this.setState({ topVendors: returned_data });
			}
		}, 2000);
	};

	_renderSearchResults = () => {
		const keyWord = this.state.searchText;
		const orderType = this.state.orderType;
		const vendorType = this.state.vendorType;
		const sortResultsBy = this.state.sortResultsBy;
		const vendors_raw = this.props.appData.vendors;
		let returned_data;
		clearTimeout(searchTimeOut);

		if (!keyWord || keyWord == '' || this.state.searchResults) {
			return false;
		}

		searchTimeOut = setTimeout(() => {

			Norsani.get('searchvendors', 'norsani', { keyword: keyWord, ordertype: orderType, vendortype: vendorType }).then((data) => {
				let raw_data = JSON.parse(data);

				//console.log("searchvendors",raw_data)

				//if (raw_data.length > 0 && orderType != 'delivery' || raw_data.length > 0 && orderType == 'delivery' && typeof vendors_raw == 'object' && Object.keys(vendors_raw).length > 0) {
				if (raw_data.length > 0 && typeof vendors_raw == 'object' && Object.keys(vendors_raw).length > 0) {

					if (orderType == 'delivery') {
						returned_data = raw_data.filter((vendor_data) => {
							let found = false;
							vendors_raw.forEach(element => {
								if (element.id == vendor_data.id)
									found = true;
							});
							return found;//vendors_raw[vendor_data.id] != undefined;
						});
					}

					returned_data = typeof returned_data == 'object' ? returned_data : raw_data;

					returned_data = returned_data.map(vendor_data => {
						if (vendors_raw[vendor_data.id] != undefined && orderType == 'delivery') {
							vendor_data.distance = vendors_raw[vendor_data.id].distance;
							vendor_data.duration = vendors_raw[vendor_data.id].duration;
							vendor_data.min_delivery = vendors_raw[vendor_data.id].min_delivery;
						}

						return (
							<ListItemVendor key={vendor_data.id} vendor_id={vendor_data.id} vendor={vendor_data} navigation={this.props.navigation} />
						);

					});


					this.setState({ searchResultsRaw: raw_data, searchResults: returned_data, isSearching: false, foundResults: true });

				} else {
					returned_data = <View><Text style={styles.noResultsText}>{i18n.t('SEARCH_NoResults', { word: keyWord })}</Text></View>;
					this.setState({ searchResultsRaw: raw_data, searchResults: returned_data, isSearching: false, foundResults: false });
				}
			}).catch((error) => console.log(error));

		}, 2000);

	};

	_sort_results = (sortType) => {
		let searchResultsRaw = this.state.searchResultsRaw;
		const orderType = this.state.orderType;

		const vendors_raw = this.props.appData.vendors;

		if (orderType == 'delivery') {
			searchResultsRaw = searchResultsRaw.filter((vendor_data) => {
				let found = false;
				vendors_raw.forEach(element => {
					if (element.id == vendor_data.id)
						found = true;
				});
				return found;
			});
		}

		if (sortType == 'popularity') {
			const vendors = searchResultsRaw.sort((a, b) => b.orders_made - a.orders_made);
			const newResults = vendors.map(vendor_data => <ListItemVendor key={vendor_data.id} vendor_id={vendor_data.id} vendor={vendor_data} navigation={this.props.navigation} />);
			this.setState({ searchResults: newResults, sortResultsBy: sortType });
		} if (sortType == 'minorderval') {
			const vendors = searchResultsRaw.sort((a, b) => a.min_delivery - b.min_delivery);
			const newResults = vendors.map(vendor_data => <ListItemVendor key={vendor_data.id} vendor_id={vendor_data.id} vendor={vendor_data} navigation={this.props.navigation} />);
			this.setState({ vendors: newResults, sortResultsBy: sortType });
		} if (sortType == 'distance') {
			const vendors = searchResultsRaw.sort((a, b) => a.distance - b.distance);
			const newResults = vendors.map(vendor_data => <ListItemVendor key={vendor_data.id} vendor_id={vendor_data.id} vendor={vendor_data} navigation={this.props.navigation} />);
			this.setState({ searchResults: newResults, sortResultsBy: sortType });
		} else if (sortType == 'toprated') {
			const vendors = searchResultsRaw.sort((a, b) => b.rating - a.rating);
			const newResults = vendors.map(vendor_data => <ListItemVendor key={vendor_data.id} vendor_id={vendor_data.id} vendor={vendor_data} navigation={this.props.navigation} />);
			this.setState({ searchResults: newResults, sortResultsBy: sortType });
		}
		/* else if (sortType == 'distance') {
			if (!this.props.userLocationCoords) {
				Alert.alert(
					i18n.t('SetYourLocation'),
					i18n.t('SEARCH_LocationRequired'),
					[{ text: i18n.t('SetYourLocation'), onPress: () => this.props.navigation.navigate('MapModal') }]
				);
				return false;
			}
			let newResults = [];
			let vendors_data = [];
			const userlatlngraw = this.props.userLocationCoords.split(',');
			const userlatlng = { latitude: userlatlngraw[0], longitude: userlatlngraw[1] };
			
			searchResultsRaw.map(vendor_data => {
				const vendor_geo_address = vendor_data.address_geo.split(',');
				if (vendor_geo_address[1]) {
					vendors_data.push({ latitude: vendor_geo_address[0], longitude: vendor_geo_address[1], vendorid: vendor_data.id })
				}
			});

			const sortedVendors = orderByDistance(userlatlng, vendors_data);				

			sortedVendors.map(vendorData => {
				const vendor_data = searchResultsRaw.find(elem => parseInt(elem.id) == parseInt(vendorData.vendorid));
				if (vendor_data) {
					newResults.push(<ListItemVendor key={vendor_data.id} vendor_id={vendor_data.id} vendor={vendor_data} navigation={this.props.navigation} />)
				}
			});
			this.setState({ searchResults: newResults, sortResultsBy: sortType });
		}  */
	};

	_saveSearchText = (search) => {
		this.setState({ searchText: search, searchResults: null, isSearching: search ? true : false, foundResults: false });
	};

	render() {
		//const acceptedOrders = this.props.acceptedOrders;

		return (
			<View style={styles.wrapper}>
				<View style={styles.searchWrapper}>
					<TextInput style={styles.searchInput} ref={input => { this.searchinput = input; }} placeholderTextColor='#1e1e1e' placeholder={i18n.t('SEARCH_Placeholder')} onChangeText={this._saveSearchText} value={this.state.searchText} />
					{this.state.searchText ? (
						<TouchableHighlight underlayColor='transparent' onPress={() => { this._saveSearchText(null) }}>
							<Text style={styles.searchCloseIconWrapper}>
								<Feather name='x' style={styles.searchCloseIcon} />
							</Text>
						</TouchableHighlight>
					) : null}
				</View>
				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.optionsVisible}
					onRequestClose={() => {
						this._openOptions(!this.state.optionsVisible)
					}}
				>
					<View style={styles.modalBodyWrapper}>
						<TouchableHighlight underlayColor='transparent' onPress={() => { this._openOptions(!this.state.optionsVisible) }}>
							<View style={{ height: viewportHeight - 300 }} />
						</TouchableHighlight>
						<View style={styles.modalBody}>
							<Text style={styles.modalTitle}>{i18n.t('SEARCH_FilterResults')}</Text>

							{Object.keys(SEARCHRESULTSSORTINGOPTIONS).map((elem, index) =>

								<TouchableHighlight style={styles.optionTitleWrapper} underlayColor='transparent' onPress={() => { this.state.optionsVisible = false; this._sort_results(elem) }}>
									<View style={styles.optionTitleWrapper}>
										<Text style={styles.optionIconWrapper}><Feather name={SEARCHRESULTSSORTINGOPTIONSICON[elem]} style={styles.optionsIcon} /></Text>
										<Text key={index} style={styles.optionTitle}>{i18n.t(SEARCHRESULTSSORTINGOPTIONS[elem])}</Text>
										{this.state.sortResultsBy == elem ? (<Text><Feather name='check' style={styles.optionsIconSelected} /></Text>) : null}
									</View>
								</TouchableHighlight>
							)}


							{/* <View style={styles.optionWrapper}>
								<View style={styles.optionTitleWrapper}>
									<Text style={styles.optionIconWrapper}><Feather name='search' style={styles.optionsIcon} /></Text>
									<Text style={styles.optionTitle}>{i18n.t('SEARCH_Show')}</Text>
								</View>
								<Picker
									selectedValue={this.state.vendorType}
									style={styles.optionPicker}
									prompt="Select vendor type"
									onValueChange={(itemValue, itemIndex) => {
										this.setState({ vendorType: itemValue, searchResults: null, isSearching: true })
									}
									}>
									{this.props.vendorTypeOptions.map((elem, index) => <Picker.Item key={index} label={elem} value={elem} />)}
								</Picker>
							</View>
							{Object.keys(acceptedOrders).length > 1 ? (
								<View style={styles.optionWrapper}>
									<View style={styles.optionTitleWrapper}>
										<Text style={styles.optionIconWrapper}><Feather name='shopping-bag' style={styles.optionsIcon} /></Text>
										<Text style={styles.optionTitle}>{i18n.t('SEARCH_Offering')}</Text>
									</View>
									<Picker
										selectedValue={this.state.orderType}
										style={styles.optionPicker}
										prompt="Select order type"
										onValueChange={(itemValue, itemIndex) => {
											this.setState({ orderType: itemValue, searchResults: null, isSearching: true })
										}
										}>
										{Object.keys(acceptedOrders).map((elem, index) => <Picker.Item key={index} label={acceptedOrders[elem] + ' ' + i18n.t('GENERALFILTERS_OrderType')} value={elem} />)}
									</Picker>
								</View>
							) : null} */}
							{/* <View style={styles.optionWrapper}>
								<View style={styles.optionTitleWrapper}>
									<Text style={styles.optionIconWrapper}><Feather name='filter' style={styles.optionsIcon} /></Text>
									<Text style={styles.optionTitle}>{i18n.t('SEARCH_SortBy')}</Text>
								</View>
								<Picker
									selectedValue={this.state.sortResultsBy}
									style={styles.optionPicker}
									prompt="Sort results by"
									onValueChange={(itemValue, itemIndex) => {
										this._sort_results(itemValue)
									}
									}>
									{Object.keys(SEARCHRESULTSSORTINGOPTIONS).map((elem, index) => <Picker.Item key={index} label={SEARCHRESULTSSORTINGOPTIONS[elem]} value={elem} />)}
								</Picker>
							</View> */}
						</View>
					</View>
				</Modal>
				{this._renderSearchResults()}
				<ScrollView
					keyboardDismissMode = 'on-drag'
					contentContainerStyle={styles.mainScrollView}
				>
					{this.state.foundResults ? (
						<TouchableHighlight underlayColor='transparent' onPress={() => { this._openOptions(!this.state.optionsVisible) }}>
							<Text style={styles.filterResults}><Feather name='sliders' style={styles.filterResultsIcon} />  {i18n.t('SEARCH_FilterResults')}</Text>
						</TouchableHighlight >
					) : null}
					{this._loadPopularVendors()}
					{this._loadTopRatedVendors()}
					{this.state.searchResults}
				</ScrollView>
				{this.state.optionsVisible ? (
					<Animated.View style={{
						backgroundColor: '#000',
						opacity: this.state.showDarkBg,
						position: 'absolute',
						left: -2,
						top: -2,
						zIndex: 50,
						height: '105%',
						width: '105%',
					}} collapsable={false} />
				) : null}

				{this.state.isSearching ? <Loading /> : null}
				<IosStatusBar />
				<NavigationEvents onDidFocus={() => {
					this.setState({
						optionsVisible: false,
						//searchText: null,
						//searchResults: null,
						//foundResults: false,
						topVendors: null,
						popularVendors: null,
						isSearching: false,
						searchResultsRaw: [],
					}, () => { setTimeout(() => { if (this.searchinput != null && this.state.searchText == null) this.searchinput.focus() }, 300) })
				}} onWillBlur={() => { this.searchinput.blur() }} />
			</View>
		);
	}
}
const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: '#fff',
	},
	searchWrapper: {
		backgroundColor: '#eeeeee',
		paddingTop: getStatusBarHeight(),
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	searchInput: {
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		height: 56,
		paddingLeft: 16,
		paddingRight: 16,
		fontSize: 16,
		flex: 1,
	},
	searchCloseIconWrapper: {
		width: 40,
		paddingLeft: rtl ? 16 : 0,
		paddingRight: rtl ? 0 : 16,
	},
	searchCloseIcon: {
		fontSize: 24,
		color: '#1e1e1e',
		textAlign: 'right',
	},
	filterResults: {
		padding: 16,
		alignSelf: 'flex-end',
	},
	filterResultsIcon: {
		fontSize: 16,
		color: '#1e1e1e',
	},
	noResultsText: {
		marginLeft: 16,
		marginRight: 16,
		marginTop: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
	},
	listTitle: {
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 32,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
		textAlign: 'left',
	},
	mainScrollView: {
		paddingBottom: 8,
		paddingTop: 8,
	},
	modalBodyWrapper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingBottom: Platform.OS === "ios" ? getStatusBarHeight() : 0,
	},
	separator: {
		height: modal_height(65),
	},
	modalBody: {
		flex: 1,
		position: 'relative',
		backgroundColor: MODALBODYCOLOR,
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
	},
	modalTitle: {
		fontSize: 16,
		paddingTop: 20,
		paddingLeft: 16,
		paddingRight: 16,
		height: 56,
		fontFamily: APPFONTMEDIUM,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		color: '#1e1e1e',
	},
	optionWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		marginTop: 10,
	},
	optionTitleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	optionTitle: {
		fontSize: 18,
		padding: 15,
		fontFamily: APPFONTREGULAR,
		textAlign: 'left',
	},
	optionIconWrapper: {
		marginLeft: 16,
	},
	optionsIcon: {
		fontSize: 16,
		color: '#1e1e1e',
	},
	optionsIconSelected: {
		fontSize: 28,
		fontFamily: APPFONTBOLD,
		color: STATUSBARCOLOR,
	},
	optionPicker: {
		height: 36,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		flex: 1,
		marginRight: 16,
	},
});

const mapStateToProps = state => {
	return {
		selectedVendorType: state.selectedVendorType,
		vendorTypeOptions: state.vendorTypeOptions,
		appData: state.appData,
		userLocationSet: state.userLocationSet,
		userLocationCoords: state.userLocationCoords,
		userLocality: state.userLocality,
		orderType: state.orderType,
		acceptedOrders: state.acceptedOrders,
	};
};

export default connect(mapStateToProps)(SearchScreen);