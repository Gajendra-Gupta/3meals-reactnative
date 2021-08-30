import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import ListItemVendor from '../components/ListItemVendor';
import PageHeader from '../components/PageHeader';
import { STATUSBARCOLOR } from '../config';

class VendorTagScreen extends React.Component {

	render () {
		let vendors = [];
		const filterTag = this.props.navigation.getParam('tag');
		for (const [key, vendor] of Object.entries(this.props.appData.vendors)) {
			
			/*Get the tags*/
			const tags = vendor.vendorclass;			
			
			if (tags.includes(filterTag)) {
				vendors.push(<ListItemVendor key={vendor.id} vendor_id={vendor.id} vendor={vendor} navigation={this.props.navigation} />);				
			}
		}
		
		if (vendors.length == 0) {
			return false;
		}
		
		return (
			<View style={styles.container}>
				<StatusBar animated={true} translucent={true} backgroundColor={STATUSBARCOLOR} barStyle="light-content" />
				<PageHeader navigation={this.props.navigation} title={filterTag} />
				<ScrollView>
					<View style={styles.tagsList}>
						{vendors}
					</View>
				</ScrollView>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	tagsList: {
		paddingTop: 16,
		paddingBottom: 8,
	}
});

const mapStateToProps = state => {
	return {
		appData: state.appData,
	};
};

export default connect(mapStateToProps)(VendorTagScreen);