import React from 'react';
import { StyleSheet, ScrollView, TextInput, Text, View, Image, TouchableHighlight, Linking, Button, Alert } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import PageHeader from '../components/PageHeader';
import i18n from '../i18n/config';
import { API_URL, APPFONTMEDIUM, APPFONTREGULAR, PRIMARYBUTTONCOLOR, STATUSBARCOLOR, WEBSITEURL } from '../config';
import iid from '@react-native-firebase/iid';


class SignupScreen extends React.Component {

	state = {
		first_name: null,
		last_name: null,
		phone_no: null,
		email: null,
		password: null,
		fcm_token: '',
		lang: i18n.locale,
	}

	componentDidMount() {
		this.initAsync();		
	}

	initAsync = async () => {
		const token = await iid().getToken();	
		this.setState({ fcm_token: token || "" });
	};

	async signup() {

		console.log("login", JSON.stringify(this.state));
		//Alert.alert(null, i18n.t('ConnectError'))

		//Alert.alert(null, i18n.t('ConnectError'))

		if (this.state.first_name == "" || this.state.first_name == null) {
			Alert.alert(null, i18n.t('ERROR_MESSAGE_FirstName'))
			return;
		}
		else if (this.state.last_name == "" || this.state.last_name == null) {
			Alert.alert(null, i18n.t('ERROR_MESSAGE_LastName'))
			return;
		}
		else if (this.state.email == "" || this.state.email == null) {
			Alert.alert(null, i18n.t('ERROR_MESSAGE_EMAIL'))
			return;
		}
		else {
			let reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (reg.test(this.state.email) === false) {
				Alert.alert(null, i18n.t('ERROR_MESSAGE_VAILD_EMAIL'))
				return;
			}

			else if (this.state.phone_no == "" || this.state.phone_no == null) {
				Alert.alert(null, i18n.t('ERROR_MESSAGE_PHONE'))
				return;
			}
			else {

				if (this.state.phone_no.length < 10) {
					Alert.alert(null, i18n.t('ERROR_MESSAGE_VAILD_PHONE'))
					return;
				}
				else if (this.state.password == "" || this.state.password == null) {
					Alert.alert(null, i18n.t('ERROR_MESSAGE_PASSWORD'))
					return;
				}
			}
		}

		let response = await fetch(API_URL + "customer_registration.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state)
		});
		let json = await response.json();

		if (json.status == 1) {
			console.log("response", json)
/* 
			let userInfo = {				
				login_type:"email",
				user: {
					photo: '',
					email: json.data.email,
					familyName: json.data.last_name,
					givenName: json.data.first_name,
					name: json.data.first_name + ' ' + json.data.last_name,
					phone: json.data.phone_no,
					id: json.data.id,
					password:this.state.password
				}
			}
			this.props.saveUserGoogleData(userInfo); */			
			Alert.alert(i18n.t("SIGNUP_SUCCESS_TITLE"), json.message);
			this.props.navigation.navigate("Login");
		}
		else {
			Alert.alert("Error", json.message);
		}


	}

	setInput = (key, search) => {
		this.setState({ ...this.state, [key]: search });
	};



	render() {

		return (
			<View style={styles.container}>

				<PageHeader navigation={this.props.navigation} title={i18n.t('PAGEHEADER_SIGNUP')} />

				<ScrollView>
					<View style={styles.userMenu}>
						<View style={styles.wrapper}>
							<TextInput style={styles.input} placeholderTextColor="gray" placeholder={i18n.t('PLACEHOLDER_FIRST_NAME')} onChangeText={val => this.setInput('first_name', val)} />
							<TextInput style={styles.input} placeholderTextColor="gray" placeholder={i18n.t('PLACEHOLDER_LAST_NAME')} onChangeText={val => this.setInput('last_name', val)} />
							<TextInput style={styles.input} placeholderTextColor="gray" keyboardType='email-address' placeholder={i18n.t('PLACEHOLDER_EMAIL')} onChangeText={val => this.setInput('email', val)} />
							<TextInput style={styles.input} placeholderTextColor="gray" keyboardType='numeric' placeholder={i18n.t('PLACEHOLDER_PHONE_NUMBER')} onChangeText={val => this.setInput('phone_no', val)} />
							<TextInput style={styles.input} placeholderTextColor="gray" secureTextEntry={true} placeholder={i18n.t('PLACEHOLDER_PASSWORD')} onChangeText={val => this.setInput('password', val)} />


							<TouchableHighlight underlayColor='transparent' onPress={() => { this.signup() }} style={{ width: '100%', alignItems: 'center' }}>
								<Text style={styles.button}>{i18n.t('BUTTON_TEXT_SIGNUP')}</Text>
							</TouchableHighlight>


							<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.navigate('Login') }} style={{ width: '100%', alignItems: 'center' }}>								
								<Text style={{color : '#3fd4a9', textDecorationLine:'underline',margin: 15}}>{i18n.t('BUTTON_TEXT_Already')}</Text>
							</TouchableHighlight>



						</View>
					</View>
				</ScrollView>
			</View>
		);
	}
}
//$P$BbBzqhPoMFiGaVVt0Gmn4bbodll7SV.

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
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
		marginTop:10,
		padding : 10,
		borderColor: 'rgba(0,0,0,0.1)',
		color: '#1e1e1e',
	},
	button: {
		margin: 40,
		backgroundColor: PRIMARYBUTTONCOLOR,
		width: 150,
		textAlign: 'center',
		padding: 10,
		color: '#fff',
		borderRadius: 10,
		fontWeight: '700',
		fontSize: 18,
		overflow : 'hidden'


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

export default connect(null, mapDispatchToProps)(SignupScreen);