import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { STATUSBARCOLOR } from '../config';

export default class IosStatusBar extends React.Component {
	
	render() {
		return Platform.OS === "ios" ? <View style={styles.iosStatusBar}/> : null;
	}
}

const styles = StyleSheet.create({
	iosStatusBar: {
		backgroundColor: STATUSBARCOLOR,
		height: getStatusBarHeight(),
		width: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
		zIndex: 60,
	},
});