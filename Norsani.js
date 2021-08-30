import NorsaniAPI from 'react-native-norsani-api';
import { WEBSITEURL, WOOCUSTOMERKEY, WOOCUSTOMERSECRET } from './config';

export const Norsani = new NorsaniAPI({
	url: WEBSITEURL, // Your Norsani Website URL
	isSsl: true,
	verifySsl: true,
	consumerKey: WOOCUSTOMERKEY, // Your WooCommerce consumer key
	consumerSecret: WOOCUSTOMERSECRET, // Your WooCommerce consumer secret
	wpAPI: true, // Enable the WP REST API integration
	queryStringAuth: true
});