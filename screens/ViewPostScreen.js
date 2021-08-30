import React from 'react';
import { StyleSheet, ScrollView, Text, View, Image, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import PageHeader from '../components/PageHeader';
import i18n from '../i18n/config';
import { APPFONTBOLD, APPFONTREGULAR } from '../config';
import WebView from 'react-native-webview';


const { width: viewportWidth } = Dimensions.get('window');

const webViewScript = `
  setTimeout(function() { 
    window.ReactNativeWebView.postMessage(document.documentElement.scrollHeight); 
  }, 50);
  true; // note: this is required, or you'll sometimes get silent failures
`;

class ViewPostScreen extends React.Component {

	state = {
		webHeight: 0,
	}

	render() {
		const item = this.props.navigation.getParam("post");

		let height = item.imageHeight / item.imageWidth * viewportWidth;

		return (
			<View style={styles.container}>

				<PageHeader navigation={this.props.navigation} title={''} />

				<ScrollView style={{ flex: 1 }}>
					<View style={{ flex: 1 }}>
						<Image source={{ uri: item.image }} style={{ height: height, width: viewportWidth }} />
						<View style={styles.imageContainer}>
							<Text style={styles.title}>{item.title}</Text>
							{/* <Text style={styles.subTitle}>{item.content}</Text> */}
							<WebView style={{ height: this.state.webHeight }}
								originWhitelist={['*']}
								automaticallyAdjustContentInsets={false}
								scrollEnabled={false}								
								onMessage={event => {									
									this.setState({ webHeight: parseInt(event.nativeEvent.data) });
								}}
								javaScriptEnabled={true}
								injectedJavaScript={webViewScript}
								domStorageEnabled={true}
								source={{ html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>'+item.content +'</body></html>'}}
							/>
						</View>
					</View>
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	title: {
		fontFamily: APPFONTBOLD,
		fontSize: 24,
		margin: 15,
		color: "#000"
	},
	subTitle: {
		fontFamily: APPFONTREGULAR,
		fontSize: 16,
		margin: 15,
		color: "#000"
	},
	image: {
		width: '100%',
		height: 300

	}
});

const mapStateToProps = state => {
	return {
		currentUser: state.currentUser,
		serverMenu: state.serverMenu,
		loggedInWith: state.loggedInWith,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		saveUserGoogleData: (user) => dispatch({ type: 'SAVEUSERGOOGLEDATA', data: user }),
	}
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewPostScreen);