import React from 'react';
import { Dimensions, Platform, StyleSheet, View, Text } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import ListItemProduct from './home/ListItemProduct';
import { connect } from 'react-redux';
import i18n from '../i18n/config';
import { APPFONTMEDIUM, APPFONTREGULAR } from '../config';

const { width: viewportWidth } = Dimensions.get('window');

const itemWidth = 138;
const sliderWidth = viewportWidth;

class CrossSells extends React.Component {
	
	_renderItem = ({item, index}) => {
		const vendors = this.props.appData.vendors;		
		return <ListItemProduct key={item.id} item={item} vendor={vendors[item.author_id]} navigation={this.props.navigation} />;
	}

    render () {
		const crossSells = this.props.crossSells;

		if (crossSells.length == 0) {
			return false;
		}

        return (
			<View style={styles.wrapper}>
				<Text style={styles.title}>{i18n.t('CROSSSELLS_YouMayAlsoLike')}</Text>
				{crossSells.length > 1 ? (
				<Carousel
					ref={(c) => { this._carousel = c; }}
					data={crossSells}
					enableMomentum={true}
					shouldOptimizeUpdates={true}
					removeClippedSubviews={true}
					decelerationRate= {0.9}
					maxToRenderPerBatch= {5}
					initialNumToRender={3}
					renderItem={this._renderItem}
					sliderWidth={sliderWidth}
					itemWidth={itemWidth}
					activeSlideAlignment='start'
					inactiveSlideOpacity={1}
					inactiveSlideScale={1}
					contentContainerCustomStyle={{overflow: 'hidden', width: itemWidth * crossSells.length + 16}}
				/>
				) : 
				crossSells.map((item,index) => this._renderItem({item,index}))
				}
			</View>
        );
    }
}
const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 16,
		paddingRight: 16,
		paddingBottom: 16,
		marginTop: 16,
		backgroundColor: '#fff',
	},
	title: {
		marginBottom: 16,
		marginLeft: 16,
		marginRight: 16,
		fontFamily: APPFONTMEDIUM,
		color: '#1e1e1e',
		fontSize: 18,
	}
});
const mapStateToProps = state => {
	return {
		crossSells: state.crossSells,
		appData: state.appData,
	};
};

export default connect(mapStateToProps)(CrossSells);