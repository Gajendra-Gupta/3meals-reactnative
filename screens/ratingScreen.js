import React from 'react';
import { StyleSheet, ScrollView, TextInput, Text, View, Image, TouchableHighlight, Linking, Button, Alert } from 'react-native';
import { connect } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import PageHeader from '../components/PageHeader';
import i18n from '../i18n/config';
import { API_URL, APPFONTMEDIUM, APPFONTREGULAR, PRIMARYBUTTONCOLOR, WEBSITEURL } from '../config';
import { Rating, AirbnbRating } from 'react-native-ratings';

class rating extends React.Component {

	state = {		
		"vendor_id": this.props.navigation.getParam('vendorid'),
		"customer_id": this.props.currentUser.user.id,
		"customer_name": this.props.currentUser.user.name,
		"order_id" : this.props.navigation.getParam('orderId'),
		"star_rating": "5",
		"review": ""
	}


	async giveRating() {

		console.log("giveRating", JSON.stringify(this.state));

		let response = await fetch(API_URL + "noorsani-review-vendor.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state)
		});

		let json = await response.json();

		console.log("response Edit", json)

		if (json.message == "Review successfully" || json.message == "Review updated successfully") {

			Alert.alert("Thank you", "Review submitted successfully")
			this.props.navigation.goBack();
		}
		else {
			Alert.alert("Error", json.message)
		} 


	}

	setInput = (key, search) => {
		this.setState({ ...this.state, [key]: search });


	};

	ratingCompleted(rating) {
		this.setInput("rating", rating)
		//console.log("Rating is: " + this.state.rating)
	}







	render() {
		const currentUser = this.props.currentUser;

		console.log("vendorid",this.props.navigation.getParam('vendorid'));
		console.log("customer id",this.props.currentUser.user.id);

		return (
			<View style={styles.container}>

				<PageHeader navigation={this.props.navigation} title={i18n.t('TEXT_RATING')} />

				<ScrollView>
					<View style={styles.userMenu}>
						<View style={styles.wrapper}>
							<AirbnbRating
								count={5}
								reviews={["Bad", "Meh", "OK", "Good", "Amazing"]}
								defaultRating={this.state.star_rating}
								onFinishRating={val => this.setInput('star_rating', val)}
								size={20}
							/>
							<TextInput style={styles.input}  placeholder={i18n.t('TEXT_NOTE')} onChangeText={val => this.setInput('review', val)} />

							<TouchableHighlight underlayColor='transparent' onPress={() => { this.giveRating() }} style={{ width: '100%', alignItems: 'center' }}>
								<Text style={styles.button}>{i18n.t('TEXT_SUBMIT')}</Text>
							</TouchableHighlight>
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
		borderColor: 'rgba(0,0,0,0.1)'
	},
	button: {
		margin: 15,
		backgroundColor: PRIMARYBUTTONCOLOR,
		width: 150,
		textAlign: 'center',
		padding: 10,
		color: '#fff',
		borderRadius: 10,
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

export default connect(mapStateToProps, mapDispatchToProps)(rating);