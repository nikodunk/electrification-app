// https://forum.leasehackr.com/t/bolt-ev-lease-bay-area-10k-36-mo-as-low-as-250-mo-plus-tax-w-3-300-drive-off-net-0-with-cvrp-and-pg-e-chevyphil-415-596-6262/100847/42

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, AsyncStorage, ScrollView, Image, FlatList, TouchableOpacity, Linking, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import Icon from 'react-native-vector-icons/Ionicons';
import Mixpanel from 'react-native-mixpanel'
import * as Animatable from 'react-native-animatable';
Mixpanel.sharedInstanceWithToken('99a084449cc885327b81217f3433be3a')
import firebase from 'react-native-firebase';
import { Button } from 'react-native-elements';

import FeedbackComponent from '../components/FeedbackComponent'

const model3Image = require('./img/model3.jpg')
const boltImage = require('./img/bolt.jpg')
const leafImage = require('./img/leaf.jpg')
const konaImage = require('./img/kona.jpg')
const etronImage = require('./img/etron.jpg')
const i3Image = require('./img/i3.jpg')
const fiatImage = require('./img/fiat.jpg')
const golfImage = require('./img/golf.jpg')

const bmwImage = require('./img/bmw330e.jpg')
const primeImage = require('./img/prime.jpg')
const voltImage = require('./img/volt.jpg')
const niroImage = require('./img/niro.jpg')



export default class HomeScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      leases: null,
      filteredLeases: null,
      email: null,
      loading: null,
      region: null
       };
  }


  componentDidMount() {

      this.setState({loading: false})
      
      // get email, except if developer mode
      AsyncStorage.getItem('email').then((res) => {
        this.setState({email: res})
        if(this.state.email !== 'niko'){Mixpanel.track("LeaseScreen Loaded"); firebase.analytics().logEvent('LeaseScreen_Loaded')}
      })


      // ------------- ** FIREBASE NOTIFICATION CODE ** -----

      firebase.messaging().getToken()
        .then(fcmToken => {
          if (fcmToken) {
            // user has a device token
            console.log('this is my FBCM token '+fcmToken)
            // this.props.putToken(this.state.phoneNo, fcmToken)
          } else {
            // user doesn't have a device token yet
          } 
        });

      firebase.messaging().hasPermission()
        .then(enabled => {
          if (enabled) {
            // user has permissions
            console.log(enabled)
          } else {
            // user doesn't have permission
            setTimeout(() => {firebase.messaging().requestPermission()
              .then(() => {
                // User has authorised  
              })
              .catch(error => {
                // User has rejected permissions  
              })}, 3000)
          } 
        });


      //if there are any unread badgets, remove them.
      firebase.notifications().setBadge(0)


      // not sure if below two are necessary.
      this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {
              // Process your notification as required
              // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
          });
      
      this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
          // Process your notification as required
          // console.log('notif received')
      });


      // ------------- ** END FIREBASE NOTIFICATION CODE ** -----


      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        () => {
          this.setState({loading: true})
          this._getLeases()
        }
      );
  }


  _getLeases(){

    // GET CURRENT LEASES
    // fetch('http://localhost:8080/api/leases/get')
    // fetch('https://electrade-server.herokuapp.com/api/leases/get')
    fetch('https://electrade-server.herokuapp.com/api/leases/all/get')
      .then((res) => { return res.json()})
      
      // set results as state
      .then((res) => {
            this.setState({leases: res});
      })

      .then(() => this._getRegion())

  }

  _getRegion(){
    AsyncStorage.getItem('region')
    .then((region) => { 
                        // should the region be set as something from the last version or it be first open default to norcal
                        if (region === null || region === '"SF Bay Area"'){
                                    this.setState({region: 'CA(N)', loading: false, regionString: 'Northern California' })
                                    AsyncStorage.setItem('region', JSON.stringify('CA(N)'))
                        }
                        // if it is set to a valid state, then make it pretty.
                        else {      let humanReadableRegion
                                    let regionString = JSON.parse(region)
                                    regionString === 'CA(N)' ? humanReadableRegion = 'Northern California' : null
                                    regionString === 'CA(S)' ? humanReadableRegion = 'Southern California' : null
                                    regionString === 'NY' ? humanReadableRegion = 'New York' : null
                                    regionString === 'CO' ? humanReadableRegion = 'Colorado' : null
                                    regionString === 'FL' ? humanReadableRegion = 'Florida' : null
                                    regionString === 'GA' ? humanReadableRegion = 'Georgia' : null
                                    regionString === 'IL' ? humanReadableRegion = 'Illinois' : null
                                    regionString === 'MA' ? humanReadableRegion = 'Massachusetts' : null
                                    regionString === 'MD' ? humanReadableRegion = 'Maryland' : null
                                    regionString === 'NJ' ? humanReadableRegion = 'New Jersey' : null
                                    regionString === 'OR' ? humanReadableRegion = 'Oregon' : null
                                    regionString === 'VA' ? humanReadableRegion = 'Virginia' : null
                                    regionString === 'WA' ? humanReadableRegion = 'Washington' : null
                                    regionString === 'RI' ? humanReadableRegion = 'Rhode Island' : null
                                    this.setState({region: regionString, loading: false, regionString: humanReadableRegion })
                            }})
    .then(() => this._filter())
  }


  _filter(){
    
    let filtered

    // filter by region
    filtered = this.state.leases.filter((item, index) => item["State"] === this.state.region )

    // deduplicate
    filtered = filtered.filter((thing, index, self) =>
                            index === self.findIndex((t) => (
                               t["Make and Model"] === thing["Make and Model"]
                          )))

    this.setState({filteredLeases: filtered})

  }



  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView style={{flex: 1}}>
          <View style={{marginBottom: 80, marginTop: 30}}>
              
              <View style={styles.deal}>
                <Text style={[styles.newsTitle, {fontSize: 20}]}>
                    This week's best EV lease offers from dealerships in
                    <Text style={{color: '#2191fb'}} onPress={() => this.props.navigation.navigate('SettingsScreen')}> {this.state.regionString}</Text>
                </Text>
              </View>



              {!this.state.loading ? 
                <View>
                  <FlatList
                    data={this.state.filteredLeases}
                    renderItem={({item, index}) => 
                                <View>
                                      <TouchableOpacity 
                                        style={{height: 210}} 
                                        delayPressIn={50}
                                        onPress={() => this.props.navigation.navigate('Details', {item: item, type: 'Lease', region: this.state.region} ) } >
                                            <View style={[styles.imageVideo, styles.videoContainer]}>
                                              <Image  style={styles.imageVideo}
                                                      source={
                                                                item.teaserImage === 'Bolt' ? boltImage : 
                                                                item.teaserImage === 'Leaf' ? leafImage : 
                                                                item.teaserImage === 'Etron' ? etronImage : 
                                                                item.teaserImage === 'Kona' ? konaImage : 
                                                                item.teaserImage === '500e' ? fiatImage : 
                                                                item.teaserImage === 'i3' ? i3Image : 
                                                                item.teaserImage === 'Golf' ? golfImage : 
                                                                item.teaserImage === '330e' ? bmwImage : 
                                                                item.teaserImage === 'Prime' ? primeImage : 
                                                                item.teaserImage === 'Volt' ? voltImage : 
                                                                item.teaserImage === 'Niro' ? niroImage : 
                                                                item.teaserImage === 'Model3' ? model3Image : 
                                                                null
                                                      } />
                                              <Text style={styles.videoTitle}>{item["Make and Model"]}: {'\n'}{item["$/mo"]}/Month,{'\n'}{item["down+acq"]} Down<Text style={styles.videoSubTitle}>*</Text></Text>
                                              {index < 3 ? <Text style={styles.videoSubTitle}>{Math.floor(Math.random() * 5) + 1 } currently looking at this offer</Text> : null }
                                              {3 < index && 1 < (Math.floor(Math.random() * 3)) ? <Text style={styles.videoSubTitle}>{Math.floor(Math.random() * 5) + 1 } currently looking at this offer</Text> : null }
                                            </View> 
                                      </TouchableOpacity>
                                  </View>
                                }
                    keyExtractor={(item, index) => index.toString()}
                    /> 


                  <Text style={{margin: 10, color: 'grey'}}>* Down Payment. See offer details for guaranteed price including all fees.</Text>
                  <Text> </Text>


                  

                  <View style={styles.separator} />
                  <Text> </Text>

                  <Animatable.View style={styles.signin} animation="zoomInUp">
                    <Text style={{fontWeight: '600', fontSize: 30}}>
                      How it works
                    </Text>
                    <Text> </Text>

                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <View style={{flex: 1}}>
                        <Icon
                          name='ios-notifications'
                          type='ionicon'
                          color='#2191fb'
                          size={40} />
                      </View>
                      <View style={{flex: 3}}>
                        <Text style={{fontWeight: '400', fontSize: 20, color: '#2191fb'}}>1 – Discover your lease.</Text> 
                        <Text style={{marginBottom: 3, fontSize: 12}}>
                          Set your location to find the right car for you. Review the terms of your lease and car details. Get in touch – speak with our team to answer any questions.
                        </Text>
                      </View>
                    </View>

                    <Text> </Text>


                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <View style={{flex: 1}}>
                        <Icon
                          name='ios-card'
                          type='ionicon'
                          color='#2191fb'
                          size={40} />
                      </View>
                      <View style={{flex: 3}}>
                        <Text style={{fontWeight: '400', fontSize: 20, color: '#2191fb'}}>2 – Select your lease.</Text> 
                        <Text style={{marginBottom: 3, fontSize: 12}}>
                          Hold your car at the set lease price ($199 deposit) or request a test drive first ($99 deposit).
                        </Text>
                      </View>
                    </View>

                    <Text> </Text>


                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <View style={{flex: 1}}>
                        <Icon
                          name='ios-car'
                          type='ionicon'
                          color='#2191fb'
                          size={40} />
                      </View>
                      <View style={{flex: 3}}>
                        <Text style={{fontWeight: '400', fontSize: 20, color: '#2191fb'}}>3 – Sign online and go.</Text> 
                        <Text style={{marginBottom: 3, fontSize: 12}}>
                          No rush! We send you all required lease documents to review and sign online via email. Finally, walk in to the dealership to pay the remainder and drive!
                        </Text>
                      </View>
                    </View>

                    <Text></Text>
                    <View style={styles.separator} />
                    <Text></Text>


                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <View style={{flex: 1}}>
                        <Icon
                          name='ios-checkbox'
                          type='ionicon'
                          color='#2191fb'
                          size={40} />
                      </View>
                      <View style={{flex: 3}}>
                        <Text style={{fontWeight: '400', fontSize: 20, color: '#2191fb'}}>
                          Money Back Guarantee
                        </Text>
                        <Text style={{marginBottom: 3, fontSize: 12}}>If we can’t help you find the right electric vehicle within 48 hours, we’ll refund 100% of your deposit.</Text>
                      </View>
                    </View>


                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <View style={{flex: 1}}>
                        <Icon
                          name='ios-lock'
                          type='ionicon'
                          color='#2191fb'
                          size={40} />
                      </View>
                      <View style={{flex: 3}}>
                        <Text style={{fontWeight: '400', fontSize: 20, color: '#2191fb'}}>
                          Hassle-Free
                        </Text>
                        <Text style={{marginBottom: 3, fontSize: 12}}>We build in all fees so the lease price is exactly what you pay. No hidden extras, no stressful negotiations.</Text>
                        <Text></Text>
                      </View>
                    </View>

                    {/*<Button
                      type="solid"
                      buttonStyle={styles.bigButton}
                      onPress={() => {this._onFinish()}}
                      title="Finish" />*/}

                  </Animatable.View> 


                  
                  
                  <View style={styles.separator} />
                  <Text> </Text>

                  <View style={styles.deal}>
                    <FeedbackComponent />
                  </View>

                  

                  {/*<View style={{margin: 10}}>
                    <Button
                      type="clear"
                      onPress={() => Linking.openURL("https://www.electricauto.org/")}
                      title="Find your local Electric Vehicle Association" 
                      />
                  </View>*/}



                  {/*<View>
                      { this.state.region === "CA(N)" ||
                        this.state.region === "CA(S)" ?
                        <View style={{margin: 10}}>
                          <Button
                            type="solid"
                            buttonStyle={styles.bigButton}
                            onPress={() => Linking.openURL("https://www.mcecleanenergy.org/ev-drivers/#EVrebate")}
                            title="MCE Clean Energy Rebate" 
                            />
                          <Text></Text>
                          <Button
                            type="solid"
                            buttonStyle={styles.bigButton}
                            onPress={() => Linking.openURL("https://cleanvehiclerebate.org/eng")}
                            title="California Incentives" 
                            />
                        </View>
                        : 
                        null
                      }
                  </View>*/}

                  </View>
              : 
              <View style={{marginTop: 100, alignItems: 'center'}}>
                <Text style={{color: 'grey'}}>Getting Newest Lease Deals... </Text>
                <ActivityIndicator />
              </View>
               }

          </View>
        </ScrollView>
      </View>
    );

  }
}