import { settingsStorage } from "settings";

function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Timezone Settings</Text>}>
        <TextInput
          label = "Short Name"
          settingsKey = "secondTimeeZoneShortName"
          />
        <Select
          label =  "Select Time Zone"
          settingsKey="secondTimeZone"
            options={[
                {name:"Algiers", offset:"+01:00"},
                {name:"Cairo", offset:"+02:00"},
                {name:"Casablanca", offset:"+00:00"},
                {name:"Johannesburg", offset:"+02:00"},
                {name:"Monrovia", offset:"+00:00"},
                {name:"Nairobi", offset:"+03:00"},
                {name:"Buenos Aires", offset:"-03:00"},
                {name:"Bogota", offset:"-05:00"},
                {name:"Caracas", offset:"-04:30"},
                {name:"Central Time", offset:"-06:00"},
                {name:"Mountain Time", offset:"-07:00"},
                {name:"Godthab", offset:"-03:00"},
                {name:"Guatemala", offset:"-06:00"},
                {name:"Guyana", offset:"-04:00"},
                {name:"Atlantic Time - Halifax", offset:"-04:00"},
                {name:"La Paz", offset:"-04:00"},
                {name:"Lima", offset:"-05:00"},
                {name:"Pacific Time", offset:"-08:00"},
                {name:"Mountain Time - Chihuahua Mazatlan", offset:"-07:00"},
                {name:"Central Time - Mexico City", offset:"-06:00"},
                {name:"Montevideo", offset:"-03:00"},
                {name:"Eastern Time", offset:"-05:00"},
                {name:"Mountain Time - Arizona", offset:"-07:00"},
                {name:"Central Time - Regina", offset:"-06:00"},
                {name:"Santiago", offset:"-03:00"},
                {name:"Sao Paulo", offset:"-02:00"},
                {name:"Newfoundland Time - St. Johns", offset:"-03:30"},
                {name:"Pacific Time - Tijuana", offset:"-08:00"},
                {name:"Almaty", offset:"+06:00"},
                {name:"Baghdad", offset:"+03:00"},
                {name:"Baku", offset:"+04:00"},
                {name:"Bangkok", offset:"+07:00"},
                {name:"Colombo", offset:"+05:30"},
                {name:"Dhaka", offset:"+06:00"},
                {name:"Hong Kong", offset:"+08:00"},
                {name:"Moscow+05 - Irkutsk", offset:"+08:00"},
                {name:"Jakarta", offset:"+07:00"},
                {name:"Jerusalem", offset:"+02:00"},
                {name:"Kabul", offset:"+04:30"},
                {name:"Moscow+09 - Petropavlovsk-Kamchatskiy", offset:"+12:00"},
                {name:"Karachi", offset:"+05:00"},
                {name:"Moscow+04 - Krasnoyarsk", offset:"+07:00"},
                {name:"Kuala Lumpur", offset:"+08:00"},
                {name:"Moscow+07 - Magadan", offset:"+10:00"},
                {name:"Rangoon", offset:"+06:30"},
                {name:"Riyadh", offset:"+03:00"},
                {name:"Seoul", offset:"+09:00"},
                {name:"China Time - Beijing", offset:"+08:00"},
                {name:"Singapore", offset:"+08:00"},
                {name:"Taipei", offset:"+08:00"},
                {name:"Tashkent", offset:"+05:00"},
                {name:"Tbilisi", offset:"+04:00"},
                {name:"Tehran", offset:"+03:30"},
                {name:"Tokyo", offset:"+09:00"},
                {name:"Ulaanbaatar", offset:"+08:00"},
                {name:"Moscow+07 - Yuzhno-Sakhalinsk", offset:"+10:00"},
                {name:"Moscow+06 - Yakutsk", offset:"+09:00"},
                {name:"Moscow+02 - Yekaterinburg", offset:"+05:00"},
                {name:"Yerevan", offset:"+04:00"},
                {name:"Azores", offset:"-01:00"},
                {name:"Cape Verde", offset:"-01:00"},
                {name:"South Georgia", offset:"-02:00"},
                {name:"Central Time - Adelaide", offset:"+10:30"},
                {name:"Eastern Time - Brisbane", offset:"+10:00"},
                {name:"Central Time - Darwin", offset:"+09:30"},
                {name:"Eastern Time - Hobart", offset:"+11:00"},
                {name:"Western Time - Perth", offset:"+08:00"},
                {name:"Eastern Time - Melbourne Sydney", offset:"+11:00"},
                {name:"Amsterdam", offset:"+01:00"},
                {name:"Athens", offset:"+02:00"},
                {name:"Central European Time - Belgrade", offset:"+01:00"},
                {name:"Berlin", offset:"+01:00"},
                {name:"Brussels", offset:"+01:00"},
                {name:"Bucharest", offset:"+02:00"},
                {name:"Budapest", offset:"+01:00"},
                {name:"Copenhagen", offset:"+01:00"},
                {name:"Dublin", offset:"+00:00"},
                {name:"Helsinki", offset:"+02:00"},
                {name:"Istanbul", offset:"+03:00"},
                {name:"Moscow-01 - Kaliningrad", offset:"+02:00"},
                {name:"Kiev", offset:"+02:00"},
                {name:"Lisbon", offset:"+00:00"},
                {name:"London", offset:"+00:00"},
                {name:"Madrid", offset:"+01:00"},
                {name:"Minsk", offset:"+03:00"},
                {name:"Moscow+00 - Moscow", offset:"+03:00"},
                {name:"Paris", offset:"+01:00"},
                {name:"Central European Time - Prague", offset:"+01:00"},
                {name:"Riga", offset:"+02:00"},
                {name:"Rome", offset:"+01:00"},
                {name:"Moscow+01 - Samara", offset:"+04:00"},
                {name:"Sofia", offset:"+02:00"},
                {name:"Stockholm", offset:"+01:00"},
                {name:"Tallinn", offset:"+02:00"},
                {name:"Vienna", offset:"+01:00"},
                {name:"Vilnius", offset:"+02:00"},
                {name:"Warsaw", offset:"+01:00"},
                {name:"Apia", offset:"+14:00"},
                {name:"Auckland", offset:"+13:00"},
                {name:"Fakaofo", offset:"+13:00"},
                {name:"Fiji", offset:"+13:00"},
                {name:"Guadalcanal", offset:"+11:00"},
                {name:"Guam", offset:"+10:00"},
                {name:"Hawaii Time", offset:"-10:00"},
                {name:"Majuro", offset:"+12:00"},
                {name:"Noumea", offset:"+11:00"},
                {name:"Pago Pago", offset:"-11:00"},
                {name:"Port Moresby", offset:"+10:00"},
                {name:"Tongatapu", offset:"+13:00"}
            ]}
          />
      </Section> 
        <Section
            title={<Text bold align="center">Other Settings</Text>}>
        <Button
          list
          label="Reset Cache"
          onClick={() => props.settingsStorage.setItem("resetCache", "true")}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
