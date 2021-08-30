import React from 'react';
import { Animated, Image, Text, Dimensions, ScrollView, Platform, StyleSheet, View, TouchableHighlight } from 'react-native';
import { Norsani} from '../Norsani';
import { APPFONTMEDIUM, STATUSBARCOLOR, SECONDARYBUTTONSCOLOR } from '../config';
import ListItemProduct from '../components/ListItemProduct';
import ListItemVendor from '../components/ListItemVendor';
import { Loading } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import i18n, { rtl } from '../i18n/config';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

const initialIndicatorPosition = rtl ? -16 : 16;
const nextIndicatorPosition = rtl ? -(viewportWidth/2) : viewportWidth/2;

class FavoritesScreen extends React.Component {
	headerScroll = new Animated.Value(0);
	
	state = {
		screen: 'vendors',
		animateTabIndicator: new Animated.Value(initialIndicatorPosition),
		headerY: Animated.multiply(Animated.diffClamp(this.headerScroll, 0, 56), -1),
	}
	
	componentDidMount = () => {
		if (this.props.favVendorsLoaded.length == 0 && this.props.favVendors.length > 0) {
			this._loadFavVendors();
		}
	};
	
	componentDidUpdate = () => {
		const screen = this.state.screen;
		if (screen == 'vendors') {
			Animated.timing(this.state.animateTabIndicator, {toValue: initialIndicatorPosition, duration: 200, useNativeDriver: true,}).start();
			if (this.props.favVendorsLoaded.length == 0 && this.props.favVendors.length > 0) {
				this._loadFavVendors();
			}
		} else {
			Animated.timing(this.state.animateTabIndicator, {toValue: (nextIndicatorPosition) + initialIndicatorPosition, duration: 200, useNativeDriver: true,}).start();
			if (this.props.favItemsLoaded.length == 0 && this.props.favItems.length > 0) {
				this._loadFavItems();
			}
		}
	};

	_loadFavVendors = () => {
		const vendors_id = this.props.favVendors;
		
		/*Load fav vendors data*/
		Norsani.get('getfavoritevendors', 'norsani', {ids: vendors_id}).then((data) => {
			const returned_data = JSON.parse(data);
			if (data) {
				this.props.saveFavVendorsLoaded(returned_data);
			}
		}).catch((error) => console.log(error));
	};
	
	_loadFavItems = () => {
		const items_id = this.props.favItems;
		
		/*Load fav items data*/
		Norsani.get('getfavoriteitems', 'norsani', {ids: items_id}).then((data) => {
			const returned_data = JSON.parse(data);
			if (data) {
				this.props.saveFavItemsLoaded(returned_data);
			}
		}).catch((error) => console.log(error));
	};

	_renderItems = () => {
		const screen = this.state.screen;
		let data = [];
		
		if (screen == 'products') {
			const items = this.props.favItemsLoaded;
			data = items.map(item => (
				<ListItemProduct key={item.id} itemData={item} navigation={this.props.navigation}/>
			));
		} else {
			const vendor = this.props.favVendorsLoaded;
			data = vendor.map(vendor_data => (
				<ListItemVendor key={vendor_data.id} vendor_id={vendor_data.id} vendor={vendor_data} navigation={this.props.navigation} />
			));
		}
		return data;
	};
	
	_renderHeader = () => {
		const screen = this.state.screen;
		
		return (
		<Animated.View style={{
			width: "100%",
			position: "absolute",
			transform: [{
				translateY: this.state.headerY
			}],
			flex: 1,
			zIndex: 2,
			...Platform.select({
			  ios: {
				shadowColor: 'black',
				shadowOffset: { height: 2, width: 0 },
				shadowOpacity: 0.25,
				shadowRadius: 3.84,
			  },
			  android: {
				elevation: 5,
			  },
			}),
		}}>
			<PageHeader navigation={this.props.navigation} hasTabs={true} title={i18n.t('FAVORITES_MyFavorites')} />
			<View style={styles.tabsWrapper}>
				<View style={styles.tabsInner}>
					<TouchableHighlight underlayColor='transparent' onPress={() => {this.setState({screen: 'vendors'})}} >
						<Text style={styles.singleTab}>{i18n.t('FAVORITES_Vendors')}</Text>
					</TouchableHighlight>
					<TouchableHighlight underlayColor='transparent' onPress={() => {this.setState({screen: 'products'})}} >
						<Text style={styles.singleTab}>{i18n.t('FAVORITES_Products')}</Text>
					</TouchableHighlight>
				</View>
				<Animated.View style={{
					width: (viewportWidth/2) - 32,
					transform: [{
						translateX: this.state.animateTabIndicator
					}],
					height: 4,
					borderRadius: 2,
					overflow: 'hidden',
					backgroundColor: SECONDARYBUTTONSCOLOR,
					position: 'absolute',
					bottom: 0,
					left: 0,
				}}/>
			</View>
		</Animated.View>
		)
	}
	
	render() {
		const screen = this.state.screen;
		if (screen == 'products' && this.props.favItemsLoaded.length == 0 && this.props.favItems.length > 0 || screen == 'vendors' && this.props.favVendorsLoaded.length == 0 && this.props.favVendors.length > 0) {
			return (
			<View style={styles.container}>
				<View style={styles.statusCover} />
				<View style={styles.innerContainer}>
					{this._renderHeader()}
					<Loading />
				</View>
			</View>
			);
		}
		
		if (screen == 'products' && this.props.favItems.length == 0 || screen == 'vendors' && this.props.favVendors.length == 0) {
			return (
			<View style={styles.container}>
				<View style={styles.statusCover} />
				<View style={styles.innerContainer}>
					{this._renderHeader()}
					<View style={styles.emptyWrapper}>
						<Text style={styles.emptyMessageIconWrapper}><Feather name='heart' style={styles.emptyMessageIcon} /></Text>
						{screen == 'products' ? (
						<Text style={styles.emptyMessage}>{i18n.t('FAVORITES_FavProductsWillBeListedHere')}</Text>
						) : (
						<Text style={styles.emptyMessage}>{i18n.t('FAVORITES_FavVendorsWillBeListedHere')}</Text>
						)}
					</View>
				</View>
			</View>
			);
		}
		
		return (
			<View style={styles.container}>
				<View style={styles.statusCover} />
				<View style={styles.innerContainer}>
					{this._renderHeader()}
					<Animated.ScrollView
						scrollEventThrottle={1}
						bounces={false}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.mainScrollView}
						onScroll={Animated.event(
							[{nativeEvent: {contentOffset: {y: this.headerScroll}}}],
							{useNativeDriver: true},
						)}
						overScrollMode="never"
					>
						{this._renderItems()}
					</Animated.ScrollView>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	statusCover: {
		height: getStatusBarHeight(),
		width: '100%',
		backgroundColor: STATUSBARCOLOR,
	},
	innerContainer: {
		flex: 1,
	},
	tabsWrapper: {
		backgroundColor: '#eeeeee',
	},
	tabsInner: {
		height: 48,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	singleTab: {
		width: viewportWidth/2,
		color: '#1e1e1e',
		fontSize: 16,
		padding: 16,
		textAlign: 'center',
		fontFamily: APPFONTMEDIUM,
	},
	mainScrollView: {
		paddingTop: 56 + getStatusBarHeight() + 48,
	},

	emptyWrapper: {
		paddingTop: 56 + getStatusBarHeight() + 48,
		margin: 16,
	},
	emptyMessageIconWrapper: {
		textAlign: 'center',
	},
	emptyMessageIcon: {
		fontSize: 80,
		color: SECONDARYBUTTONSCOLOR,
	},
	emptyMessage: {
		fontSize: 24,
		paddingTop: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		textAlign: 'center',
	},
});

const mapStateToProps = state => {
	return {
		favVendors: state.favVendors,
		favVendorsLoaded: state.favVendorsLoaded,
		favItems: state.favItems,
		favItemsLoaded: state.favItemsLoaded,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		saveFavVendors: (vendorslist) => dispatch({type: 'SAVEFAVVENDORS', data: vendorslist}),
		saveFavVendorsLoaded: (vendors) => dispatch({type: 'SAVEFAVVENDORSLOADED', data: vendors}),
		saveFavItems: (itemslist) => dispatch({type: 'SAVEFAVITEMS', data: itemslist}),
		saveFavItemsLoaded: (items) => dispatch({type: 'SAVEFAVITEMSLOADED', data: items})
	};
};

export default connect(mapStateToProps,mapDispatchToProps)(FavoritesScreen);