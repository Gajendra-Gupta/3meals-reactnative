import React from "react"
import { View, Picker, Text, Platform, Modal, StyleSheet, TouchableHighlight } from "react-native"
import i18n, { rtl } from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR, PRIMARYBUTTONCOLOR } from '../config';

class NorsaniDynamicPicker extends React.Component {
	state = {
		// picked items
		selectedOptions: {},
		// for ios select in modal
		iosModalVariation: "",
	}

	variationChange = (listName, value) => {
		let selectedOptions = this.state.selectedOptions
		if (value === "empty") {
			delete selectedOptions[listName]
		} else {
			selectedOptions[listName] = value
		}
		this.setState({
			selectedOptions: selectedOptions,
		}, this.findSelectedVariation)
	}

	findSelectedVariation = () => {
		if (Object.keys(this.state.selectedOptions).length === Object.keys(this.props.variationOptions).length) {
			let selectedVariation = {}
			this.props.variations.forEach(variation => {
				let canAdd = variation.options.every(option => {
					return option.selection === "" || option.selection === this.state.selectedOptions[option.title]
				})
				if (canAdd) {
					let shouldAdd = variation.options.some(option => {
						const inSelected = Object.keys(selectedVariation).length === 0 ? null : selectedVariation.options.find(elem => elem.title === option.title)
						return inSelected === null || (inSelected.selection === "" && option.selection !== "")
					})
					if (shouldAdd) {
						selectedVariation = variation
					}
				}
			})
			this.props.saveSelectedVars({
				id: selectedVariation ? selectedVariation.id : null,
				price: selectedVariation ? selectedVariation.price: null,
				description: selectedVariation ? selectedVariation.description : null,
				options: selectedVariation ? this.state.selectedOptions : null
			})
		} else {
			this.props.saveSelectedVars({
				id: null,
				price: null,
				description: null,
				options: null
			})
		}
	}

	openIosModal = listName => {
		this.setState({
			iosModalVariation: listName
		})
	}

	dismissIosModal = () => {
		this.setState({
			iosModalVariation: ""
		})
	}

	render() {
		const list = Object.keys(this.props.variationOptions).map(selectName => {
			const selectOptions = []
			this.props.variationOptions[selectName].forEach(option => {
				let foundVariation = this.props.variations.some(variation => {
					return variation.options.every(variationOption => {
						return (variationOption.title === selectName && (variationOption.selection === option || variationOption.selection === "")) || (variationOption.title !== selectName && (!this.state.selectedOptions[variationOption.title] || variationOption.selection === "" || this.state.selectedOptions[variationOption.title] === variationOption.selection))
					})
				})
				if (foundVariation) {
					selectOptions.push(option)
				}
			})
			return {
				name: selectName,
				options: selectOptions
			}
		})

		return (
			<View>
				{Platform.OS === "ios" && this.state.iosModalVariation !== "" &&
				<Modal visible={true} transparent={true}>
					<View style={styles.iosModal}>
						<View style={styles.iosModalInner}>
							<Picker
								selectedValue={this.state.selectedOptions[this.state.iosModalVariation]} style={styles.iosPicker}
								onValueChange={(value, index) => this.variationChange(this.state.iosModalVariation, value)}
							>
								<Picker.Item label={this.state.iosModalVariation} value="empty" />
								{list.find(elem => elem.name === this.state.iosModalVariation).options.map(option => {
									return <Picker.Item key={option} label={option} value={option} />
								})}
							</Picker>
							<View style={styles.dismissModalBtn}>
								<TouchableHighlight underlayColor='transparent' onPress={this.dismissIosModal}>
									<Text style={styles.iosModalDoneText}>{i18n.t('NDPICKER_Done')}</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				</Modal>
				}
				{list.map(listItem => {
					return Platform.OS === "ios" ? (
						<TouchableHighlight underlayColor='transparent' key={listItem.name} onPress={() => {this.openIosModal(listItem.name)}}>
							<View style={styles.iosPickerButton}>
								<Text style={styles.iosPickerButtonText}>{this.state.selectedOptions[listItem.name] ? this.state.selectedOptions[listItem.name] : listItem.name}</Text>
							</View>
						</TouchableHighlight>
					) : (
						<View style={styles.pickerWrapper} key={listItem.name + Math.random()}>
							<Picker
								selectedValue={this.state.selectedOptions[listItem.name] ? this.state.selectedOptions[listItem.name] : ""}
								style={styles.androidPicker}
								onValueChange={(value, index) => {this.variationChange(listItem.name, value)}}
							>
								<Picker.Item label={listItem.name} value="empty" />
								{listItem.options.map(option => {
									return <Picker.Item key={option} label={option} value={option} />
								})}
							</Picker>
						</View>
					)
				})}
			</View>
		)
	}
}

styles = StyleSheet.create({
	iosModal: {
		display: "flex",
		backgroundColor: "rgba(0, 0, 0, 0.35)",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%"
	},
	iosModalInner: {
		backgroundColor: "#fff",
		width: "80%",
		borderRadius: 7,
		overflow: 'hidden',
	},
	pickerWrapper: {
		marginTop: 12,
		marginBottom: 12,
		backgroundColor: 'rgba(0,0,0,0.05)',
		borderRadius: 7,
		overflow: 'hidden',
	},
	androidPicker: {
		color: '#1e1e1e',
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		width: '92%',
		marginLeft: 12,
		marginRight: 12,
		textAlign: 'left',
	},
	iosPicker: {
		color: '#1e1e1e',
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		width: "100%"
	},
	iosModalDoneText: {
		marginTop: 16,
		fontSize: 16,
		padding: 16,
		width: '100%',
		textAlign: 'center',
		textTransform: 'uppercase',
		fontFamily: APPFONTMEDIUM,
		color: PRIMARYBUTTONCOLOR,
	},
	iosPickerButton: {
		marginTop: 16,
		marginBottom: 16,
	},
	iosPickerButtonText: {
		fontSize: 14,
		textTransform: 'uppercase',
		fontFamily: APPFONTMEDIUM,
		color: PRIMARYBUTTONCOLOR,
	}
})

export default NorsaniDynamicPicker;