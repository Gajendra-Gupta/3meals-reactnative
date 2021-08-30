import React from 'react';
import { ScrollView, Modal, Animated, Text, StyleSheet, View, TouchableHighlight } from 'react-native';
import { API_URL, APPFONTMEDIUM, STATUSBARCOLOR, HOMEHEADINGTEXTCOLOR, PRIMARYBUTTONCOLOR, MODALBODYCOLOR } from '../config';
import i18n from '../i18n/config';
import Feather from 'react-native-vector-icons/Feather';
import { Rating } from 'react-native-ratings';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { color } from 'react-native-reanimated';
import moment from "moment";



class VendorReviews extends React.Component {

	state = {
		reviews: {},
	}

	componentDidMount = () => {
		this.getRating();
	}


	async getRating() {

		let response = await fetch(API_URL + "get_vendor_review.php", {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ "vendor_id": this.props.vendor_id })
		});

		let json = await response.json();

		console.log("review", json.review)

		if (json.review)
			this.setState({ reviews: json.review });


	}




	render() {

		let showReviews = this.props.showReviews;


		/* let Reviews = [
			{ "review": "Very good Job", "star_rating": 5, "date": "2021-02-05", "user_name": "Markaus" },
			{ "review": "Nice Job", "star_rating": 4, "date": "2021-01-23", "user_name": "Burhan" },
			{ "review": "Very good Job", "star_rating": 3, "date": "2021-01-15", "user_name": "Lokesh" },
			{ "review": "Great Job done", "star_rating": 5, "date": "2021-01-10", "user_name": "Gajendra" },
			{ "review": "Very good Job", "star_rating": 4, "date": "2021-01-2", "user_name": "Saif" },
		]; */

		const Reviews = this.state.reviews;


		return (
			<Modal
				animationType="slide"
				transparent={true}
				visible={showReviews == true}
				onRequestClose={() => {
					this.props.navigation.setParams({ showReviews: false });
				}}
			>
				<View style={styles.modalBodyWrapper}>
					<TouchableHighlight underlayColor='transparent' onPress={() => { this.props.navigation.setParams({ showReviews: false }); }}>
						<View style={styles.separator} />
					</TouchableHighlight>
					<View style={styles.modalBody}>
						<Text style={styles.modalTitle}>{i18n.t('VENDOR_Reviews')}</Text>


						<ScrollView
							contentContainerStyle={styles.mainScrollView}
							style={styles.mainScrollView}
						>

							{Object.keys(Reviews).map((element, index) => {
								let first_name = Reviews[element].customer_name.split(" ")[0];
								let last_name = '';
								if (Reviews[element].customer_name.split(" ").length > 1) {
									last_name = Reviews[element].customer_name.split(" ")[1];
									last_name = last_name.substr(0, 1);
								}

								return (
									<View style={{ padding: 10, borderBottomWidth: 0.5, borderColor: 'rgba(0,0,0,0.2)', }}>
										<View style={{ flexDirection: 'row' }}>
											<Text style={styles.name}>{first_name + " " + last_name}</Text>
											<Rating
												ratingBackgroundColor='#ff000'
												startingValue={Reviews[element].rating}
												readonly
												imageSize={20}
											//style={{ alignItems: 'flex-end', paddingVertical: 10 }}
											/>
										</View>
										<Text style={{ color: 'gray' }}>
											{moment(Reviews[element].create_date).format("DD MMM YYYY hh:mm A")}
										</Text>






										<Text style={{ color: '#000' }}>{Reviews[element].review}</Text>
									</View>);
							}
							)}

						</ScrollView>

					</View>
				</View>

			</Modal>

		)
	}
}


const styles = StyleSheet.create({
	modalBodyWrapper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		paddingBottom: Platform.OS === "ios" ? getStatusBarHeight() : 0,
	},
	separator: {
		height: '25%'
	},
	modalBody: {
		flex: 1,
		position: 'relative',
		backgroundColor: '#fff',
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
	},
	modalTitle: {
		fontSize: 18,
		paddingTop: 20,
		paddingLeft: 16,
		paddingRight: 16,
		height: 56,
		fontFamily: APPFONTMEDIUM,
		borderBottomWidth: 1,
		borderColor: 'rgba(0,0,0,0.1)',
		color: '#1e1e1e',
	},
	ratingWrapper: {
		flexDirection: 'row'
	},
	rating: {
		color: STATUSBARCOLOR,
		fontSize: 16,
	},
	name: {
		fontSize: 20,
		color: STATUSBARCOLOR,
		fontFamily: APPFONTMEDIUM,
		flex: 1

	}
});

export default VendorReviews;