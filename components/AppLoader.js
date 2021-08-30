import React from 'react';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import ContentLoader from './ContentLoader';
import LinearGradient from 'react-native-linear-gradient';
import i18n, { rtl } from '../i18n/config';

const titleBgWidth = 300;
const titleBgHeight = 120;

const titleAnimation = new Animated.Value(-titleBgWidth);

export default class AppLoader extends React.Component {

	_animateTitle = () => {
		titleAnimation.setValue(-titleBgWidth);
		
		Animated.timing(titleAnimation, {
			toValue: titleBgWidth,
			duration: 1500,
			useNativeDriver: true
		}).start(e => e.finished && this._animateTitle());
	}
	
	_titleBg = () => {
		return (
			<Animated.View style={[styles.animatedBg, {
				width: titleBgWidth,
				height: titleBgHeight,
				transform: [{
					translateX: titleAnimation
				}]
			}]}>
			<LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 1}} colors={['rgba(255,255,255,0.7)', 'transparent']} style={[styles.animatedGradient,{
				width: titleBgWidth / 2,
				height: titleBgHeight,
			}]}/>
			<LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 1}} colors={['transparent', 'rgba(255,255,255,0.7)']} style={[styles.animatedGradient,{
				width: titleBgWidth / 2,
				height: titleBgHeight,
			}]}/>
			</Animated.View>
		);
	}
	
	render() {
		this._animateTitle();
		
		return (
			<View style={styles.container}>
				<View style={styles.headerWrapper}>
					<View style={styles.headerRight}>
						<View style={styles.headerIcon} collapsable={false}/>
					</View>
				</View>
				<View style={styles.innerContainer}>
					<ScrollView
							contentContainerStyle={styles.mainScrollView}
						>
						<View style={styles.headerTitleWrapper}>
							<View style={styles.headerLine1} collapsable={false} />
							<View style={styles.headerLine2} collapsable={false} />
							{this._titleBg()}
						</View>
						<ContentLoader/>
					</ScrollView>
				</View>
			</View>
		);
	}
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
		backgroundColor: '#fff',
	},
	headerWrapper: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 56 + getStatusBarHeight(),
		paddingTop: getStatusBarHeight(),
		paddingLeft: 16,
		paddingRight: 16,
		width: "100%",
		position: "absolute",
		zIndex: 10,
	},
	headerRight: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row-reverse',
		alignItems: 'center',
	},
	headerIcon: {
		width: 24,
		height: 24,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: '#ddd',
	},
	innerContainer: {
		flex: 1,
	},
	mainScrollView: {
		paddingTop: 56 + getStatusBarHeight(),
	},
	headerTitleWrapper: {
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
	headerLine1: {
		height: 32,
		width: '80%',
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 12,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: '#ddd',
	},
	headerLine2: {
		height: 32,
		width: '70%',
		marginLeft: 16,
		marginRight: 16,
		marginBottom: 12,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: '#ddd',
	},
});