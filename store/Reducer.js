import AsyncStorage from '@react-native-community/async-storage';

const initioalState = {
	appLoaded: false,
	appTitle: null,
	acceptedOrders: [],
	noResultsMsg: null,

	cartTotals: {},
	cartItemsData: {},
	checkoutData: [],
	coupons: [],
	crossSells: [],
	updateCheckout: false,
	updateData: true,

	currentUser: {},
	loggedInWith: null,
	userLocation: null,
	userLocationCoords: null,
	userLocationSet: false,
	userLocality: null,
	userLocalityCoords: null,
	localityOptions: [],
	locationClicked: false,
	orderType: null,

	appData: {},
	deliveryVendors: [],
	selectedVendorType: null,
	vendorTypeOptions: [],
	distanceDivider: 1,
	distanceUnitFullName: null,
	distanceUnitShortName: null,


	favVendors: [],
	favItems: [],
	favVendorsLoaded: [],
	favItemsLoaded: [],

	serverMenu: [],

	isPaypalOpen: false
};


const Reducer = (state = initioalState, action) => {
	switch (action.type) {
		case 'SAVEFAVITEMSLOADED':
			return {
				...state,
				favItemsLoaded: action.data ? action.data : [],
			};
		case 'SAVEFAVVENDORSLOADED':
			return {
				...state,
				favVendorsLoaded: action.data ? action.data : [],
			};
		case 'SAVEFAVITEMS':
			AsyncStorage.setItem('FAVITEMS', action.data ? JSON.stringify(action.data) : null);
			return {
				...state,
				favItems: action.data ? action.data : [],
				favItemsLoaded: [],
			};
		case 'SAVEFAVVENDORS':
			AsyncStorage.setItem('FAVVENDORS', action.data ? JSON.stringify(action.data) : null);
			return {
				...state,
				favVendors: action.data ? action.data : [],
				favVendorsLoaded: [],
			};
		case 'CLEARUSERDATA':
			AsyncStorage.multiRemove(['USERDATA', 'LOGGEDINWITH']);
			return {
				...state,
				currentUser: {},
				loggedInWith: null,
				updateData: true,
			};
		case 'SAVEUSERGOOGLEDATA':
			AsyncStorage.multiSet([['USERDATA', action.data ? JSON.stringify(action.data) : null], ['LOGGEDINWITH', 'google']]);
			return {
				...state,
				currentUser: action.data ? action.data : {},
				loggedInWith: 'google',
				updateData: true,
			};
		case 'CHECKOUTDATA':
			return {
				...state,
				cartTotals: action.total ? action.total : {},
				cartItemsData: action.cartitemsdata ? action.cartitemsdata : {},
				checkoutData: action.checkoutdata ? action.checkoutdata : [],
				coupons: Array.isArray(action.coupons) ? action.coupons : state.coupons,
				updateCheckout: false,
			};
		case 'SAVECART':
			AsyncStorage.multiSet(
				[
					['cartTotals', action.total ? JSON.stringify(action.total) : JSON.stringify({})], 
					['cartItemsData', action.cartitemsdata ? JSON.stringify(action.cartitemsdata) : JSON.stringify({})], 
					['coupons', Array.isArray(action.coupons) ? JSON.stringify(action.coupons) : JSON.stringify(state.coupons)], 
					['crossSells', action.crosssells ? JSON.stringify(action.crosssells) : JSON.stringify([])],
				]);
			return {
				...state,
				cartTotals: action.total ? action.total : {},
				cartItemsData: action.cartitemsdata ? action.cartitemsdata : {},
				coupons: Array.isArray(action.coupons) ? action.coupons : state.coupons,
				crossSells: action.crosssells ? action.crosssells : [],
				updateCheckout: true,
			};
		case 'LOADAPP':
			return {
				...state,
				userLocality: action.data.userlocality ? action.data.userlocality : null,
				userLocalityCoords: action.data.userlocalitycoords ? action.data.userlocalitycoords : null,
				selectedVendorType: action.data.vendortype ? action.data.vendortype : null,
				vendorTypeOptions: action.data.vendortypes ? action.data.vendortypes : null,
				currentUser: action.data.userdata ? action.data.userdata : {},
				loggedInWith: action.data.loggedinwith ? action.data.loggedinwith : null,
				favVendors: action.data.favvendors ? action.data.favvendors : [],
				favItems: action.data.favitems ? action.data.favitems : [],
				serverMenu: action.data.server_menu.length > 0 ? action.data.server_menu : [],
				userLocation: action.data.userlocation ? action.data.userlocation : 'Set your location',
				userLocationCoords: action.data.userlocationcoords ? action.data.userlocationcoords : null,
				userLocationSet: action.data.userlocationcoords ? true : false,
				orderType: action.data.ordertype ? action.data.ordertype : Object.keys(action.data.ordertypes)[0],
				acceptedOrders: action.data.ordertypes ? action.data.ordertypes : [],
				appTitle: action.data.apptitle ? action.data.apptitle : null,
				distanceDivider: action.data.distancedivider,
				distanceUnitFullName: action.data.distanceunitfullname,
				distanceUnitShortName: action.data.distanceunitshortname,
				appData: action.data,
				deliveryVendors: action.deliveryvendors ? action.deliveryvendors : [],
				updateData: false,
				noResultsMsg: action.noresultsmsg,
				appLoaded: true,
			};
		case 'SETVENDORSTYPE':
			AsyncStorage.setItem('VENDORTYPE', action.data);
			return {
				...state,
				selectedVendorType: action.data,
				appData: {},
				updateData: true,
			};
		case 'SETORDERSTYPE':
			AsyncStorage.setItem('ORDERTYPE', action.data);
			return {
				...state,
				orderType: action.data,
				//appData: {},
				//cartTotals: {},
				//cartItemsData: {},
				//coupons: [],
				crossSells: [],
				updateData: true,
			};
		case 'SETUSERLOCATION':
			AsyncStorage.multiSet([['USERLOCATION', action.loc], ['USERLOCATIONCOORDS', action.coords]]);
			return {
				...state,
				userLocation: action.loc,
				userLocationCoords: action.coords,
				userLocationSet: true,
				locationClicked: action.locclicked,
				appData: {},
				cartTotals: {},
				cartItemsData: {},
				coupons: [],
				crossSells: [],
				updateData: true,
			};
		case 'SETUSERLOCATIONONLY':			
			AsyncStorage.multiSet([['USERLOCATION', action.loc], ['USERLOCATIONCOORDS', action.coords]]);
			return {
				...state,
				userLocation: action.loc,
				userLocationCoords: action.coords,
				userLocationSet: true,
				locationClicked: action.locclicked,				
				updateData: true,
			};
		case 'SETUSERLOCALITY':
			AsyncStorage.multiSet([['USERLOCALITY', action.data], ['USERLOCALITYCOORDS', action.coords]]);
			return {
				...state,
				userLocality: action.data,
				userLocalityCoords: action.coords,
				appData: {},
				cartTotals: {},
				cartItemsData: {},
				coupons: [],
				crossSells: [],
				updateData: true,
			};
		case 'UPDATEAPPDATA':
			return {
				...state,
				appData: action.appdata,
				deliveryVendors: action.deliveryvendors ? action.deliveryvendors : [],
				updateData: false,
			};
		case 'SETLOCALITYOPTIONS':
			return {
				...state,
				localityOptions: action.options,
			};
		case 'SETPAYPALSTATUS':
			return {
				...state,
				isPaypalOpen: action.isPaypalOpen,
			};
		default:
			return state;
	}
};

export default Reducer;