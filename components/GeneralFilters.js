import React from 'react';
import { Animated, ActivityIndicator, Text, View, ScrollView, Platform, Modal, Picker, Dimensions, TouchableOpacity, TouchableHighlight, StyleSheet, Button, Image, Alert } from 'react-native';
import { connect } from 'react-redux';
import { Norsani } from '../Norsani';
import { APPFONTMEDIUM, APPFONTREGULAR, GOOGLEAPIKEY, MODALBODYCOLOR, SECONDARYBUTTONSCOLOR } from '../config';
import Geocoder from 'react-native-geocoding';
import Feather from 'react-native-vector-icons/Feather';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import i18n, { rtl } from '../i18n/config';

const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

modal_height = (percentage) => {
	const value = (percentage * viewportHeight) / 100;
	return Math.round(value);
};

class GeneralFilters extends React.Component {

	state = {
		savingLocality: false,
		animateLocalityPicker: new Animated.Value(viewportHeight),
		animateVendorTypePicker: new Animated.Value(viewportHeight),
		animateOrderTypePicker: new Animated.Value(viewportHeight),
	}

	_loadResourcesAsync = async () => {
		return Promise.all(Norsani.get('localityoptions', 'norsani').then((data) => {
			if (data) {
				const localities = JSON.parse(data);
				this.props.setLocalityOptions(localities);
			}
		}).catch(error => console.log(error)));
	};


	_getLocationForm = () => {
		const checkLocation = this.props.userLocationSet;

		return (
			<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.hide(); this.props.navigation.navigate('MapModal') }}>
				<View style={styles.optionWrapper}>
					<Text style={styles.optionTitleIcon}><Feather name='map-pin' style={styles.optionTitleIcons} /></Text>
					{checkLocation ? (
						<Text style={styles.optionTitle} numberOfLines={1}>{i18n.t('GENERALFILTERS_To')} {this.props.userloc}</Text>
					) : (
							<Text style={styles.optionTitle} numberOfLines={1}>{i18n.t('SetYourLocation')}</Text>
						)}
				</View>
			</TouchableHighlight>
		);
	};

	_getLocalityOption = () => {

		if (this.props.localityOptions.length == 0) {
			return (
				<View style={styles.optionWrapper}>
					<Image style={styles.loadingLocality} source={require('../assets/images/Loading.gif')} onLoadEnd={this._loadResourcesAsync} />
				</View>
			);
		} else {
			return (
				<TouchableHighlight underlayColor='transparent' onPress={() => {
					Animated.timing(this.state.animateLocalityPicker, { toValue: 0, duration: 250, useNativeDriver: true, }).start();
				}}>
					<View style={styles.optionWrapper}>
						<Text style={styles.optionTitleIcon}><Feather name='navigation' style={styles.optionTitleIcons} /></Text>
						<Text style={styles.optionTitlePrefix}>{i18n.t('GENERALFILTERS_Near')} </Text>

						{this.state.savingLocality ? (

							<Image style={styles.loadingLocality} source={require('../assets/images/Loading.gif')} />

						) : (

								<Text style={styles.optionTitle} numberOfLines={1}>{this.props.userLocality}</Text>

							)}
					</View>
				</TouchableHighlight>
			);
		}
	};

	_getLocalityForm = () => {
		let options = [];


		for (let i = 0; i < this.props.localityOptions.length; i++) {
			const localityOption = this.props.localityOptions[i];
			options.push(<TouchableOpacity key={i} onPress={() => {
				this.setState({ savingLocality: true });
				Geocoder.init(GOOGLEAPIKEY);
				Geocoder.from(localityOption.value)
					.then(json => {
						const glocation = json.results[0].geometry.location;
						const locationCoords = glocation.lat + ',' + glocation.lng;
						this.setState({ savingLocality: false }, () => this.props.setUserLocality(localityOption.value, locationCoords));
						this.props.hide();
					}).catch(error => error.message ? Alert.alert(null, error.message) : console.log(error));
			}}>
				<View style={[styles.singleOptionWrapper, {
					paddingLeft: this.props.userLocality == localityOption.value ? 16 : 72
				}]}>
					{this.props.userLocality == localityOption.value ? (
						<Text style={styles.selectedValueIconWrapper}><Feather name='check' style={styles.selectedValueIcon} /></Text>
					) : null}
					<Text style={styles.singleOptionValue} numberOfLines={1}>{localityOption.label}</Text>
				</View>
			</TouchableOpacity>);
		}

		if (this.props.localityOptions.length != 0) {

			return (
				<Animated.View style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					zIndex: 60,
					backgroundColor: MODALBODYCOLOR,
					transform: [{
						translateY: this.state.animateLocalityPicker
					}]
				}} pointerEvents={this.state.savingLocality ? 'none' : 'auto'}>
					<View style={styles.pickerTitleWrapper}>
						<Text style={styles.pickerTitleIcon}><Feather name='navigation' style={styles.pickerIcon} /></Text>
						<Text style={styles.pickerTitle} numberOfLines={1}>{i18n.t('GENERALFILTERS_Near')} {this.props.userLocality}</Text>
						{this.state.savingLocality ? (
							<ActivityIndicator color={SECONDARYBUTTONSCOLOR} size='small' />
						) : (
								<TouchableHighlight underlayColor='transparent' onPress={() => {
									this.props.hide();
									Animated.timing(this.state.animateLocalityPicker, { toValue: viewportHeight, duration: 250, useNativeDriver: true, }).start();
								}}>
									<Text style={styles.pickerCloseBtnWrapper}><Feather name='x' style={styles.pickerCloseBtn} /></Text>
								</TouchableHighlight>
							)}
					</View>
					<ScrollView>
						{options}
					</ScrollView>
				</Animated.View>
			);
		}
	};

	_getVendorTypeOption = () => {

		return (
			<TouchableHighlight underlayColor='transparent' onPress={() => {
				Animated.timing(this.state.animateVendorTypePicker, { toValue: 0, duration: 250, useNativeDriver: true, }).start();
			}}>
				<View style={styles.optionWrapper}>
					<Text style={styles.optionTitleIcon}><Feather name='filter' style={styles.optionTitleIcons} /></Text>
					<Text style={styles.optionTitle}>{i18n.t('GENERALFILTERS_Search')} {this.props.selectedVendorType}</Text>
				</View>
			</TouchableHighlight>
		);
	};

	_getVendorTypeForm = () => {
		let options = [];

		for (let i = 0; i < this.props.vendorTypeOptions.length; i++) {
			const vendorTypeOption = this.props.vendorTypeOptions[i];
			options.push(<TouchableOpacity key={i} onPress={() => { this.props.setVendorsType(vendorTypeOption); this.props.hide(); }}>
				<View style={[styles.singleOptionWrapper, {
					paddingLeft: this.props.selectedVendorType == vendorTypeOption ? 16 : 72
				}]}>
					{this.props.selectedVendorType == vendorTypeOption ? (
						<Text style={styles.selectedValueIconWrapper}><Feather name='check' style={styles.selectedValueIcon} /></Text>
					) : null}
					<Text style={styles.singleOptionValue} numberOfLines={1}>{vendorTypeOption}</Text>
				</View>
			</TouchableOpacity>);
		}

		return (
			<Animated.View style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				zIndex: 60,
				backgroundColor: MODALBODYCOLOR,
				transform: [{
					translateY: this.state.animateVendorTypePicker
				}]
			}} >
				<View style={styles.pickerTitleWrapper}>
					<Text style={styles.pickerTitleIcon}><Feather name='filter' style={styles.pickerIcon} /></Text>
					<Text style={styles.pickerTitle} numberOfLines={1}>{i18n.t('GENERALFILTERS_Search')} {this.props.selectedVendorType}</Text>
					<TouchableHighlight underlayColor='transparent' onPress={() => {
						this.props.hide();
						Animated.timing(this.state.animateVendorTypePicker, { toValue: viewportHeight, duration: 250, useNativeDriver: true, }).start();
					}}>
						<Text style={styles.pickerCloseBtnWrapper}><Feather name='x' style={styles.pickerCloseBtn} /></Text>
					</TouchableHighlight>
				</View>
				<ScrollView>
					{options}
				</ScrollView>
			</Animated.View>
		);
	};

	_getOrderTypeOption = () => {
		const acceptedOrders = this.props.acceptedOrders;

		if (Object.keys(acceptedOrders).length < 2) {
			return null;
		}

		return (
			<TouchableHighlight underlayColor='transparent' onPress={() => {
				Animated.timing(this.state.animateOrderTypePicker, { toValue: 0, duration: 250, useNativeDriver: true, }).start();
			}}>
				<View style={styles.optionWrapper}>
					<Text style={styles.optionTitleIcon}><Feather name='shopping-bag' style={styles.optionTitleIcons} /></Text>
					<Text style={styles.optionTitle}>{i18n.t('GENERALFILTERS_OrderType')} {acceptedOrders[this.props.orderType]}</Text>
				</View>
			</TouchableHighlight>
		);
	};

	_getOrderTypeForm = () => {
		let options = [];

		const acceptedOrders = this.props.acceptedOrders;

		if (Object.keys(acceptedOrders).length < 2) {
			return null;
		}
		

		for (const [key, val] of Object.entries(acceptedOrders)) {
			options.push(<TouchableOpacity key={key} onPress={() => { this.props.setOrdersType(key); this.props.hide(); }}>
				<View style={[styles.singleOptionWrapper, {
					paddingLeft: this.props.orderType == key ? 16 : 72
				}]}>
					{this.props.orderType == key ? (
						<Text style={styles.selectedValueIconWrapper}><Feather name='check' style={styles.selectedValueIcon} /></Text>
					) : null}
					<Text style={styles.singleOptionValue} numberOfLines={1}>{val}</Text>
				</View>
			</TouchableOpacity>);
		}

		return (
			<Animated.View style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				zIndex: 60,
				backgroundColor: MODALBODYCOLOR,
				transform: [{
					translateY: this.state.animateOrderTypePicker
				}]
			}} >
				<View style={styles.pickerTitleWrapper}>
					<Text style={styles.pickerTitleIcon}><Feather name='shopping-bag' style={styles.pickerIcon} /></Text>
					<Text style={styles.pickerTitle} numberOfLines={1}>{i18n.t('GENERALFILTERS_OrderType')} {acceptedOrders[this.props.orderType]}</Text>
					<TouchableHighlight underlayColor='transparent' onPress={() => {
						this.props.hide();
						Animated.timing(this.state.animateOrderTypePicker, { toValue: viewportHeight, duration: 250, useNativeDriver: true, }).start();
					}}>
						<Text style={styles.pickerCloseBtnWrapper}><Feather name='x' style={styles.pickerCloseBtn} /></Text>
					</TouchableHighlight>
				</View>
				<ScrollView>
					{options}
				</ScrollView>
			</Animated.View>
		);
	};

	render() {		

		/* if (this.props.orderType != 'delivery')
			Animated.timing(this.state.animateLocalityPicker, { toValue: 0, duration: 250, useNativeDriver: true, }).start();
		else	 */
		if (this.props.type == 'vendor_type')
			Animated.timing(this.state.animateVendorTypePicker, { toValue: 0, duration: 250, useNativeDriver: true, }).start();
		else if (this.props.type == 'order_type')	
				Animated.timing(this.state.animateOrderTypePicker, { toValue: 0, duration: 250, useNativeDriver: true, }).start();			
		else if (this.props.orderType != 'delivery')
			Animated.timing(this.state.animateLocalityPicker, { toValue: 0, duration: 250, useNativeDriver: true, }).start();


		return (
			<Modal
				animationType="slide"
				transparent={true}
				visible={this.props.show}
				onRequestClose={() => {
					this.props.hide();
				}} >
				<View style={styles.modalBody}>
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.hide() }}>
						<View style={styles.separator} />
					</TouchableHighlight>
					<View style={styles.optionsWrapper}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalHeaderTitle}>{i18n.t('GENERALFILTERS_ViewOptions')}</Text>
							<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.hide() }}>
								<Text style={styles.modalHeaderTitleIcon}><Feather name='x' style={styles.modalCloseBtn} /></Text>
							</TouchableHighlight>
						</View>
						<View style={styles.options}>
							{this._getVendorTypeOption()}
							{this._getOrderTypeOption()}
							{this.props.orderType == 'delivery' ? this._getLocationForm() : this._getLocalityOption()}
						</View>
						{this._getVendorTypeForm()}
						{this._getOrderTypeForm()}
						{this.props.orderType != 'delivery' ? this._getLocalityForm() : null}

					</View>
				</View>
			</Modal>
		);
	}
}

const styles = StyleSheet.create({
	modalBody: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingBottom: Platform.OS === "ios" ? getStatusBarHeight() : 0,
	},
	separator: {
		height: modal_height(70),
	},
	optionsWrapper: {
		flex: 1,
		backgroundColor: MODALBODYCOLOR,
		position: 'relative',
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
	},
	modalHeader: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
	},
	modalHeaderTitle: {
		flex: 1,
		fontSize: 16,
		color: '#1e1e1e',
		padding: 16,
		fontFamily: APPFONTMEDIUM,
	},
	modalHeaderTitleIcon: {
		padding: 16,
	},
	modalCloseBtn: {
		fontSize: 24,
		color: '#1e1e1e',
	},
	optionWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
	},
	optionTitleIcon: {
		marginRight: 32,
	},
	optionTitleIcons: {
		fontSize: 24,
		color: '#1e1e1e',
	},
	optionTitlePrefix: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
	},
	optionTitle: {
		fontSize: 16,
		flex: 1,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		textAlign: 'left',
	},
	pickerTitleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)'
	},
	pickerTitleIcon: {
		marginRight: 32,
	},
	pickerIcon: {
		fontSize: 24,
		color: '#1e1e1e',
	},
	pickerTitle: {
		fontSize: 16,
		color: '#1e1e1e',
		fontFamily: APPFONTMEDIUM,
		flex: 1,
	},
	pickerCloseBtnWrapper: {
		marginLeft: 16,
	},
	pickerCloseBtn: {
		fontSize: 24,
		color: '#1e1e1e',
	},
	singleOptionWrapper: {
		paddingTop: 16,
		paddingRight: 16,
		paddingBottom: 16,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	selectedValueIconWrapper: {
		marginRight: 32,
	},
	selectedValueIcon: {
		fontSize: 24,
		color: '#1e1e1e',
	},
	singleOptionValue: {
		flex: 1,
		fontSize: 14,
		color: '#1e1e1e',
		fontFamily: APPFONTREGULAR,
	},
});

const mapStateToProps = state => {

	return {
		userLocality: state.userLocality,
		localityOptions: state.localityOptions,
		vendorTypeOptions: state.vendorTypeOptions,
		selectedVendorType: state.selectedVendorType,
		orderType: state.orderType,
		userloc: state.userLocation,
		userLocationSet: state.userLocationSet,
		acceptedOrders: state.acceptedOrders,
	};
};

const mapDispatchToProps = dispatch => {

	return {
		setLocalityOptions: (opts) => dispatch({ type: 'SETLOCALITYOPTIONS', options: opts }),
		setUserLocality: (locality, loccoords) => dispatch({ type: 'SETUSERLOCALITY', data: locality, coords: loccoords }),
		setVendorsType: (vendortype) => dispatch({ type: 'SETVENDORSTYPE', data: vendortype }),
		setOrdersType: (ordertype) => dispatch({ type: 'SETORDERSTYPE', data: ordertype }),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralFilters);