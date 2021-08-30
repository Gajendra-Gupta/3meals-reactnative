import React from 'react';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';
import { rtl } from '../i18n/config';
import LinearGradient from 'react-native-linear-gradient';

const productsWidth = 122;
const productsHeight = 142;
const vendorsWidth = 260;
const vendorsHeight = 200;

const vendorsAnimation = new Animated.Value(-vendorsWidth);
const ProductsAnimation = new Animated.Value(-productsWidth);

export default class ContentLoader extends React.Component {

	_animateVendors = () => {
		vendorsAnimation.setValue(-vendorsWidth);
		
		Animated.timing(vendorsAnimation, {
			toValue: vendorsWidth,
			duration: 1500,
			useNativeDriver: true
		}).start(e => e.finished && this._animateVendors());
	}
	
	_animateProducts = () => {
		ProductsAnimation.setValue(-productsWidth);
		
		Animated.timing(ProductsAnimation, {
			toValue: productsWidth,
			duration: 1500,
			useNativeDriver: true
		}).start(e => e.finished && this._animateProducts());
	}
	
	_productsBg = () => {
		const color = '#eee';
		return (
			<Animated.View style={[styles.animatedBg, {
				width: productsWidth,
				height: productsHeight,
				transform: [{
					translateX: ProductsAnimation
				}]
			}]}>
			<LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 1}} colors={[color, 'transparent']} style={[styles.animatedGradient,{
				width: productsWidth / 2,
				height: productsHeight,
			}]}/>
			<LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 1}} colors={['transparent', color]} style={[styles.animatedGradient,{
				width: productsWidth / 2,
				height: productsHeight,
			}]}/>
			</Animated.View>
		);
	}
	
	_vendorsBg = () => {
		const color = 'rgba(255,255,255,0.7)';
		return (
			<Animated.View style={[styles.animatedBg, {
				width: vendorsWidth,
				height: vendorsHeight,
				transform: [{
					translateX: vendorsAnimation
				}]
			}]}>
			<LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 1}} colors={[color, 'transparent']} style={[styles.animatedGradient,{
				width: vendorsWidth / 2,
				height: vendorsHeight,
			}]}/>
			<LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 1}} colors={['transparent', color]} style={[styles.animatedGradient,{
				width: vendorsWidth / 2,
				height: vendorsHeight,
			}]}/>
			</Animated.View>
		);
	}
		
	render() {
		this._animateVendors();
		this._animateProducts();
		
		return (
			<View style={styles.container}>
				<View style={styles.contentBlock}>
					<ScrollView
						horizontal={true}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.contentBlockScrollView}
						>
						
						<View style={styles.contentBlockItem}>
							<View style={styles.contentBlockItemImage}/>
							<View style={styles.contentBlockItemDetailsWrapper}>
								<View style={styles.contentBlockItemLogo}/>
								<View style={styles.contentBlockItemdetails}>
									<View style={styles.contentBlockItemName}/>
									<View style={styles.contentBlockItemText}/>
								</View>
							</View>
							{this._vendorsBg()}
						</View>
						<View style={styles.contentBlockItem}>
							<View style={styles.contentBlockItemImage}/>
							<View style={styles.contentBlockItemDetailsWrapper}>
								<View style={styles.contentBlockItemLogo}/>
								<View style={styles.contentBlockItemdetails}>
									<View style={styles.contentBlockItemName}/>
									<View style={styles.contentBlockItemText}/>
								</View>
							</View>
							{this._vendorsBg()}
						</View>
						<View style={styles.contentBlockItem}>
							<View style={styles.contentBlockItemImage}/>
							<View style={styles.contentBlockItemDetailsWrapper}>
								<View style={styles.contentBlockItemLogo}/>
								<View style={styles.contentBlockItemdetails}>
									<View style={styles.contentBlockItemName}/>
									<View style={styles.contentBlockItemText}/>
								</View>
							</View>
							{this._vendorsBg()}
						</View>
					</ScrollView>
				</View>
				<View style={styles.contentProductBlock}>
					<View style={styles.contentBlockTitleWrapper}>
						<View style={styles.contentBlockIcon} />
						<View style={styles.contentBlockTitle} />
					</View>
					<ScrollView
						horizontal={true}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.contentBlockScrollView}
						>
						
						<View style={styles.contentProductBlockItem}>
							{this._productsBg()}
						</View>
						<View style={styles.contentProductBlockItem}>
							{this._productsBg()}
						</View>
						<View style={styles.contentProductBlockItem}>
							{this._productsBg()}
						</View>
					</ScrollView>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentBlock: {
		paddingTop: 16,
		paddingBottom: 16,
		marginTop: 16,
	},
	contentBlockTitleWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		marginLeft: 16,
	},
	contentBlockScrollView: {
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
	},
	contentBlockItem: {
		width: vendorsWidth,
		marginLeft: rtl ? 0 : 16,
		marginRight: rtl ? 16 : 0,
		overflow: 'hidden',
		position: 'relative',
	},
	contentBlockItemImage: {
		borderRadius: 7,
		width: '100%',
		height: 120,
		backgroundColor: '#ddd',
		overflow: 'hidden',
		position: 'relative',
	},
	contentBlockItemDetailsWrapper: {
		display: 'flex',
		flexDirection: 'row',
		paddingTop: 16,
	},
	contentBlockItemLogo: {
		height: 40,
		width: 40,
		marginRight: 16,
		borderRadius: 20,
		backgroundColor: '#ddd',
		overflow: 'hidden',
	},
	contentBlockItemdetails: {
		marginRight: 16,
		flex: 1,
	},
	contentBlockItemName: {
		marginRight: 16,
		marginBottom: 8,
		height: 12,
		width: 100,
		backgroundColor: '#ddd',
	},
	contentBlockItemText: {
		marginTop: 4,
		height: 12,
		width: 150,
		backgroundColor: '#ddd',
	},
	contentProductBlock: {
		paddingTop: 32,
		paddingBottom: 32,
		marginTop: 16,
		backgroundColor: '#ddd',
	},
	contentProductBlockItem: {
		width: productsWidth,
		height: productsHeight,
		marginLeft: rtl ? 0 : 16,
		marginRight: rtl ? 16 : 0,
		backgroundColor: '#fff',
		borderRadius: 7,
		overflow: 'hidden',
		position: 'relative',
	},
	animatedBg: {
		position: 'absolute',
		top: 0,
		left: 0,
		display: 'flex',
		flexDirection: rtl ? 'row-reverse' : 'row',
		alignItems: 'center',
	},
});