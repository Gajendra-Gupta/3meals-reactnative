import React from 'react';
import { StyleSheet, ScrollView, TextInput, Text, View, Image, TouchableHighlight, Linking, Button, BackHandler, Alert, Platform } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import PageHeader from '../components/PageHeader';
import { GoogleSignin } from 'react-native-google-signin';
import { LoginButton, LoginManager, AccessToken, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import { appleAuthAndroid, appleAuth } from '@invertase/react-native-apple-authentication';
//import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid'
import jwt_decode from "jwt-decode";
import i18n from '../i18n/config';
import { API_URL, APPFONTBOLD, APPFONTMEDIUM, APPFONTREGULAR, HOMEHEADINGCOLOR, PRIMARYBUTTONCOLOR, STATUSBARCOLOR, WEBSITEURL } from '../config';
import iid from '@react-native-firebase/iid';


class LoginScreen extends React.Component {

	state = {
		email: null,
		password: null,
		fcm_token: '',
		lang: i18n.locale,
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
		this.initAsync();
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
	}

	handleBackButton() {
		BackHandler.exitApp();
		return true;
	}

	async adduserData(data) {
		let response = await fetch(API_URL + "customer_registration.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		let json = await response.json();

		console.log("adduserData req", data)
		console.log("adduserData response", json)


	}


	async login() {

		console.log("login", JSON.stringify(this.state));

		if (this.state.email == "" || this.state.email == null) {
			Alert.alert(null, i18n.t('ERROR_MESSAGE_EMAIL'))
			return;
		}
		else if (this.state.password == "" || this.state.password == null) {
			Alert.alert(null, i18n.t('ERROR_MESSAGE_PASSWORD'))
			return;
		}

		let response = await fetch(API_URL + "customer_login.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state)
		});
		let json = await response.json();

		console.log("response", json)

		if (json.status == 1) {

			let userInfo = {
				login_type: "email",
				user: {
					photo: '',
					email: json.data.email,
					familyName: json.data.last_name,
					givenName: json.data.first_name,
					name: json.data.first_name + ' ' + json.data.last_name,
					phone: json.data.phone_no,
					id: json.data.id,
					password: this.state.password
				}
			}
			console.log("userInfo", userInfo);

			this.props.saveUserGoogleData(userInfo);

			if (this.props.navigation.getParam("from") == 'checkout')
				this.props.navigation.goBack(null);
			else
				this.props.navigation.navigate("Main");
		}
		else {
			Alert.alert("Error", json.message)
		}


	}

	setInput = (key, search) => {
		this.setState({ ...this.state, [key]: search });
	};

	initAsync = async () => {
		GoogleSignin.configure();

		const token = await iid().getToken();
		//console.log("TOKEN", token);
		this.setState({ fcm_token: token || "" });
	};

	signInAsync = async () => {
		try {
			await GoogleSignin.hasPlayServices();
			const userInfo = await GoogleSignin.signIn();
			console.log("userInfo", userInfo);

			let userdata = {
				first_name: userInfo.user.givenName,
				last_name: userInfo.user.familyName,
				phone_no: userInfo.user.phone ? userInfo.user.phone : "",
				email: userInfo.user.email,
				password: userInfo.user.id,
			}
			this.adduserData(userdata);

			userInfo.user.phone = "";
			userInfo.login_type = "Eamil";
			userInfo.user.password = userInfo.user.id;
			this.props.saveUserGoogleData(userInfo);
			if (this.props.navigation.getParam("from") == 'checkout')
				this.props.navigation.goBack(null);
			else
				this.props.navigation.navigate("Main");
		} catch (error) {
			console.log(error);
			Alert.alert(i18n.t('Error'), i18n.t('LOGINGOOGLE_ErrorMsg'));
		}
	};

	async onFacebookButtonPress() {
		// Attempt login with permissions
		const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

		console.log("onFacebookButtonPress", result);

		if (result.isCancelled) {
			throw 'User cancelled the login process';
		}

		// Once signed in, get the users AccesToken
		const data = await AccessToken.getCurrentAccessToken();

		console.log("AccessToken", data);

		if (!data) {
			throw 'Something went wrong obtaining access token';
		}

		const PROFILE_REQUEST_PARAMS = {
			fields: {
				string: 'id, name, first_name, last_name, birthday, email'
			},
		}
		let token = data.accessToken;

		const profileRequest = new GraphRequest('/me', { token, parameters: PROFILE_REQUEST_PARAMS },
			(error, result) => {
				if (error) {
					console.log('Login Info has an error:', error)
				} else {
					console.log(result);
					result.user = {
						name: result.name,
						givenName: result.first_name,
						familyName: result.last_name,
						email: result.email,
						phone: "",
						password: result.id
					};
					result.login_type = "facebook";
					console.log(result);
					this.props.saveUserGoogleData(result);
					if (this.props.navigation.getParam("from") == 'checkout')
						this.props.navigation.goBack(null);
					else
						this.props.navigation.navigate("Main");

					let userdata = {
						first_name: result.first_name,
						last_name: result.last_name,
						phone_no: "",
						email: result.email,
						password: result.id,
					}
					this.adduserData(userdata);
				}
			},
		)
		new GraphRequestManager().addRequest(profileRequest).start()
	}

	async doAppleLogin() {

		console.log("OS",Platform.OS );
		if (Platform.OS != 'android') {
			this.doAppleLoginIOS();
			return;
		}

		try {
			// Initialize the module
			appleAuthAndroid.configure({
				clientId: "com.my3meals.demo",
				redirectUri: "https://my.3meals.de/wp-content/plugins/norsani-api/includes/appleLogin.php",
				scope: appleAuthAndroid.Scope.ALL,
				responseType: appleAuthAndroid.ResponseType.ALL,
			});

			const response = await appleAuthAndroid.signIn();
			if (response) {
				processAppleLogin(appleAresponseuthRequestResponse);
			}
		} catch (error) {
			if (error && error.message) {
				switch (error.message) {
					case appleAuthAndroid.Error.NOT_CONFIGURED:
						Alert.prompt("appleAuthAndroid not configured yet.");
						break;
					case appleAuthAndroid.Error.SIGNIN_FAILED:
						Alert.prompt("Apple signin failed.");
						break;
					case appleAuthAndroid.Error.SIGNIN_CANCELLED:
						Alert.prompt("User cancelled Apple signin.");
						break;
					default:
						break;
				}
			}
		}
	};

	async doAppleLoginIOS() {
		// performs login request
		const appleAuthRequestResponse = await appleAuth.performRequest({
			requestedOperation: appleAuth.Operation.LOGIN,
			requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
		});


		console.log("appleAuthRequestResponse", appleAuthRequestResponse);


		// get current authentication state for user
		// /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
		const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

		// use credentialState response to ensure the user is authenticated
		if (credentialState === appleAuth.State.AUTHORIZED) {
			// user is authenticated
			this.processAppleLogin(appleAuthRequestResponse);

		}
	}

	async processAppleLogin(response) {


		const code = Platform.OS == 'android' ? response.code : response.authorizationCode; // Present if selected ResponseType.ALL / ResponseType.CODE
		const id_token = Platform.OS == 'android' ? response.id_token : response.identityToken; // Present if selected ResponseType.ALL / ResponseType.ID_TOKEN
		const user = response.user; // Present when user first logs in using appleId


		console.log("code", code);
		console.log("id_token", id_token);


		if (Platform.OS = 'ios' && response.email) {

			response.user = {
				name: response.fullName.givenName + " " + response.fullName.familyName,
				givenName: response.fullName.givenName,
				familyName: response.fullName.familyName,
				email: response.email,
				phone: "",
				password: code
			};
			response.login_type = "apple";
			console.log(response);
			this.props.saveUserGoogleData(response);
			if (this.props.navigation.getParam("from") == 'checkout')
				this.props.navigation.goBack(null);
			else
				this.props.navigation.navigate("Main");

			let userdata = {
				first_name: response.fullName.givenName,
				last_name: response.fullName.familyName,
				phone_no: "",
				email: response.email,
				password: code,
			}
			this.adduserData(userdata);

		}
		else if (Platform.OS == 'android' && user) {
			let response = {};
			response.user = {
				name: user.name.firstName + " " + user.name.lastName,
				givenName: user.name.firstName,
				familyName: user.name.lastName,
				email: user.email,
				phone: "",
				password: code
			};
			response.login_type = "apple";
			console.log(response);
			this.props.saveUserGoogleData(response);
			if (this.props.navigation.getParam("from") == 'checkout')
				this.props.navigation.goBack(null);
			else
				this.props.navigation.navigate("Main");

			let userdata = {
				first_name: user.name.firstName,
				last_name: user.name.lastName,
				phone_no: userInfo.user.phone,
				email: user.email,
				password: code,
			}
			this.adduserData(userdata);

		} else {


			console.log("id_token", id_token);
			var decoded = jwt_decode(id_token);
			console.log("email", decoded.email);

			let req = { "email": decoded.email }

			let response = await fetch(API_URL + "getUserData.php", {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(req)
			});
			let json = await response.json();

			console.log("json", json);

			let data = {}

			data.user = {
				name: json.data.first_name + " " + json.data.last_name,
				givenName: json.data.first_name,
				familyName: json.data.last_name,
				email: decoded.email,
				phone: json.data.phone_no,
				password: json.data.password
			};
			data.login_type = "apple";
			console.log(data);
			this.props.saveUserGoogleData(data);
			if (this.props.navigation.getParam("from") == 'checkout')
				this.props.navigation.goBack(null);
			else
				this.props.navigation.navigate("Main");
		}

	}


	render() {

		const from = this.props.navigation.getParam('from');

		return (
			<View style={styles.container}>

				<PageHeader navigation={this.props.navigation} title={i18n.t('PAGEHEADER_LOGIN')} from={from} />

				<ScrollView>
					<View style={styles.userMenu}>
						<View style={styles.wrapper}>

							<Text style={styles.title}>{i18n.t('LOGIN_TITLE')}</Text>
							<Text style={styles.subTitle}>{i18n.t('LOGIN_SUB_TITLE')}</Text>

							<Text style={styles.inputLabel}>{i18n.t('PLACEHOLDER_EMAIL')}</Text>
							<TextInput style={styles.input} keyboardType='email-address' placeholderTextColor="gray" placeholder={i18n.t('PLACEHOLDER_EMAIL')} onChangeText={val => this.setInput('email', val)} />
							<Text style={styles.inputLabel}>{i18n.t('PLACEHOLDER_PASSWORD')}</Text>
							<TextInput style={styles.input} secureTextEntry={true} placeholderTextColor="gray" placeholder={i18n.t('PLACEHOLDER_PASSWORD')} onChangeText={val => this.setInput('password', val)} />

							<TouchableHighlight underlayColor='transparent' onPress={() => { this.login() }} style={{ width: '100%', alignItems: 'center' }}>
								<Text style={styles.button}>Login</Text>
							</TouchableHighlight>

							<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('Signup') }} style={{ width: '100%', alignItems: 'center' }}>
								<Text style={{ color: '#3fd4a9', textDecorationLine: 'underline', margin: 15 }}>{i18n.t('BUTTON_TEXT_NewUser')}</Text>
							</TouchableHighlight>

							<View style={styles.orWrapper}>
								<View style={styles.line}></View>
								<Text >OR</Text>
								<View style={styles.line}></View>
							</View>



							<TouchableHighlight underlayColor='transparent' onPress={this.signInAsync} >
								<View style={[styles.button, { backgroundColor: '#D75B55' }]}>
									<Image resizeMode='contain' style={{ width: 20, height: '100%' }} source={require('../assets/images/google.png')} />
									<Text style={styles.buttonText}>{i18n.t("LOGIN_GoogleButton")}</Text>
								</View>
								{/* <Image resizeMode='contain' style={styles.SocialButton} source={require('../assets/images/google.png')} /> */}
							</TouchableHighlight>

							<TouchableHighlight underlayColor='transparent' onPress={() => this.onFacebookButtonPress().then(() => console.log('Signed in with Facebook!'))}>
								<View style={[styles.button, { backgroundColor: '#4267B3' }]}>
									<Image resizeMode='contain' style={{ width: 20, height: '100%' }} source={require('../assets/images/facebook.png')} />
									<Text style={styles.buttonText}>{i18n.t("LOGIN_FacebookButton")}</Text>
								</View>
								{/* <Image resizeMode='contain' style={styles.SocialButton} source={require('../assets/images/facbook.png')} /> */}
							</TouchableHighlight>

							<TouchableHighlight underlayColor='transparent' onPress={() => this.doAppleLogin()}>
								<View style={[styles.button, { backgroundColor: '#000000' }]}>
									<Image resizeMode='contain' style={{ width: 20, height: '100%' }} source={require('../assets/images/apple.png')} />
									<Text style={styles.buttonText}>{i18n.t("LOGIN_AppleButton")}</Text>
								</View>
								{/* <Image resizeMode='contain' style={styles.SocialButton} source={require('../assets/images/apple.png')} /> */}
							</TouchableHighlight>







							{/* <View style={styles.SocialButton}>
								<LoginButton
									onLoginFinished={
										(error, result) => {
											if (error) {
												console.log("login has error: " + result.error);
											} else if (result.isCancelled) {
												console.log("login is cancelled.");
											} else {
												AccessToken.getCurrentAccessToken().then(
													(data) => {
														console.log(data.accessToken.toString())
													}
												)
											}
										}
									}
									onLogoutFinished={() => console.log("logout.")} />
							</View> */}


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
		backgroundColor: '#fff'
	},
	orWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 28,
		fontFamily: APPFONTBOLD,
		marginTop: 10,
		paddingLeft: 10,
		color: 'black'
	},
	subTitle: {
		fontSize: 18,
		fontFamily: APPFONTREGULAR,
		paddingLeft: 10,
	},
	line: {
		flex: 1,
		backgroundColor: HOMEHEADINGCOLOR,
		height: 2,
		margin: 15
	},
	userMenu: {
		marginBottom: 8,
		marginTop: 8,
	},
	separator: {
		borderBottomWidth: 1,
		marginLeft: 16,
		borderColor: 'rgba(0,0,0,0.1)'
	},
	input: {
		borderBottomWidth: 1,
		marginLeft: 16,
		marginRight: 15,
		padding: 10,
		borderColor: 'rgba(0,0,0,0.1)',
		color: '#1e1e1e',
	},
	inputLabel: {
		marginLeft: 10,
		marginTop: 15,
		fontWeight: 'bold'
	},
	button: {
		marginTop: 15,
		marginBottom: 15,
		marginLeft: '5%',
		marginRight: '5%',
		backgroundColor: PRIMARYBUTTONCOLOR,
		width: '90%',
		textAlign: 'center',
		padding: 12,
		color: '#fff',
		borderRadius: 5,
		fontWeight: '700',
		fontSize: 18,
		flexDirection: 'row',
		overflow: 'hidden'
	},
	buttonText: {
		color: '#fff',
		textAlign: 'center',
		fontWeight: '700',
		fontSize: 18,
		flex: 1,
	},
	SocialButton: {
		marginLeft: '5%',
		width: '90%',
		textAlign: 'center',
		color: '#fff',
		fontWeight: '700',
		fontSize: 18
	},
	listItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 56,
	},
	menuIcon: {
		paddingTop: 16,
		paddingBottom: 16,
		paddingRight: 32,
		paddingLeft: 16,
		color: '#1e1e1e',
		fontSize: 24,
	},
	listItemTitle: {
		flex: 2,
		fontSize: 16,
		fontFamily: APPFONTREGULAR,
		color: '#1e1e1e',
	},
});

const mapDispatchToProps = dispatch => {
	return {
		saveUserGoogleData: (user) => dispatch({ type: 'SAVEUSERGOOGLEDATA', data: user }),
	}
};

export default connect(null, mapDispatchToProps)(LoginScreen);