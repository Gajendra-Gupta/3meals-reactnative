import React from 'react';
import { Text, View, ActivityIndicator, Image, StyleSheet, TouchableWithoutFeedback, FlatList } from 'react-native';
import i18n, { rtl } from '../../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../../config';

export class VendorsTags extends React.Component {
	
	_renderItem = ({item, index}) => {

		return (
		<TouchableWithoutFeedback key={index} onPress={() => this.props.navigation.navigate('VendorTag', {tag: item.name})} >
			<View style={styles.tagWrapper} >
				<View style={styles.imageWrapper}>
					<Image source={{uri: item.thumb}} style={styles.tagsImage} resizeMode='cover' PlaceholderContent={<ActivityIndicator />} />
				</View>
				<Text numberOfLines={2} style={styles.tagName}>{ item.name }</Text>
			</View>
		</TouchableWithoutFeedback>
		);
	}

    render () {
		const tags = this.props.tagsData;
		
		if (tags.length == 0) {
			return false;
		}
		
        return (
			<View style={styles.wrapper}>
				<Text style={styles.title}>{i18n.t('VENDORSTAGS')}</Text>
				<FlatList
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.contentContainer}
					data={tags}
					removeClippedSubviews={true}
					renderItem={this._renderItem}
					keyExtractor = { (item, index) => index.toString() }
					/>
			</View>
        );
    }
}
const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 16,
		paddingBottom: 16,
		marginTop: 16,
	},
	contentContainer: {
		paddingRight: rtl ? 0 : 16,
		paddingLeft: rtl ? 16 : 0,
	},
	title: {
		marginBottom: 16,
		marginLeft: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
	},
	tagWrapper: {
		marginLeft: 16,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		width: 76,
	},
	imageWrapper: {
		width: 70,
		height: 70,
		display: 'flex',
		alignItems: 'center',
		borderRadius: 35,
		overflow: 'hidden',
		borderWidth: .5,
		borderColor: 'rgba(0,0,0,0.1)'
	},
	tagsImage: {
		height: 70,
		width: 70,
		//marginTop: 11,
	},
	tagName: {
		marginTop: 12,
		fontSize: 14,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		textAlign: 'center',
	}
});