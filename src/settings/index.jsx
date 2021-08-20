import { settingsStorage } from "settings";

function mySettings(props) {
  let timeZoneSet = [
    {name:"GMT +0:00: Monrovia",offset:"+00:00",location:"Monrovia,LR"},
    {name:"GMT +0:00: London",offset:"+00:00",location:"London,UK"},
    {name:"GMT +0:00: Lisbon",offset:"+00:00",location:"Lisbon,PT"},
    {name:"GMT +0:00: Dublin",offset:"+00:00",location:"Dublin,IE"},
    {name:"GMT +0:00: Casablanca",offset:"+00:00",location:"Casablanca,MA"},
    {name:"GMT +1:00: Algiers",offset:"+01:00",location:"Algiers,DZ"},
    {name:"GMT +1:00: Central European Time - Prague",offset:"+01:00",location:"Prague,CZ"},
    {name:"GMT +1:00: Paris",offset:"+01:00",location:"Paris,FR"},
    {name:"GMT +1:00: Madrid",offset:"+01:00",location:"Madrid,ES"},
    {name:"GMT +1:00: Berlin",offset:"+01:00",location:"Berlin,DE"},
    {name:"GMT +1:00: Central European Time - Belgrade",offset:"+01:00",location:"Belgrade,RS"},
    {name:"GMT +1:00: Amsterdam",offset:"+01:00",location:"Amsterdam,N:"},
    {name:"GMT +1:00: Copenhagen",offset:"+01:00",location:"Copenhagen,DK"},
    {name:"GMT +1:00: Budapest",offset:"+01:00",location:"Budapest,HU"},
    {name:"GMT +1:00: Brussels",offset:"+01:00",location:"Brussels,BE"},
    {name:"GMT +1:00: Vienna",offset:"+01:00",location:"Vienna,AT"},
    {name:"GMT +1:00: Warsaw",offset:"+01:00",location:"Warsaw,PL"},
    {name:"GMT +1:00: Stockholm",offset:"+01:00",location:"Stockholm,SE"},
    {name:"GMT +1:00: Rome",offset:"+01:00",location:"Rome,IT"},
    {name:"GMT +2:00: Tallinn",offset:"+02:00",location:"Tallinn,EE"},
    {name:"GMT +2:00: Bucharest",offset:"+02:00",location:"Bucharest,RO"},
    {name:"GMT +2:00: Vilnius",offset:"+02:00",location:"Vilnius,LT"},
    {name:"GMT +2:00: Athens",offset:"+02:00",location:"Athens,GR"},
    {name:"GMT +2:00: Cairo",offset:"+02:00",location:"Cairo,EG"},
    {name:"GMT +2:00: Jerusalem",offset:"+02:00",location:"Jerusalem,IL"},
    {name:"GMT +2:00: Johannesburg",offset:"+02:00",location:"Johannesburg,ZA"},
    {name:"GMT +2:00: Moscow-01 - Kaliningrad",offset:"+02:00",location:"Kaliningrad,RU"},
    {name:"GMT +2:00: Riga",offset:"+02:00",location:"Riga,LV"},
    {name:"GMT +2:00: Sofia",offset:"+02:00",location:"Sofia,BG"},
    {name:"GMT +2:00: Kiev",offset:"+02:00",location:"Kiev,UA"},
    {name:"GMT +2:00: Helsinki",offset:"+02:00",location:"Helsinki,SF"},
    {name:"GMT +3:00: Riyadh",offset:"+03:00",location:"Riyadh,SA"},
    {name:"GMT +3:00: Istanbul",offset:"+03:00",location:"Istanbul,TR"},
    {name:"GMT +3:00: Moscow+00 - Moscow",offset:"+03:00",location:"Moscow,RU"},
    {name:"GMT +3:00: Nairobi",offset:"+03:00",location:"Nairobi,KE"},
    {name:"GMT +3:00: Minsk",offset:"+03:00",location:"Minsk,BY"},
    {name:"GMT +3:00: Baghdad",offset:"+03:00",location:"Baghdad,IQ"},
    {name:"GMT +3:30: Tehran",offset:"+03:30",location:"Teheran,IR"},
    {name:"GMT +4:00: Tbilisi",offset:"+04:00",location:"Tbilisi,GE"},
    {name:"GMT +4:00: Yerevan",offset:"+04:00",location:"Yerevan,AM"},
    {name:"GMT +4:00: Moscow+01 - Samara",offset:"+04:00",location:"Samara,RU"},
    {name:"GMT +4:00: Baku",offset:"+04:00",location:"Baku,AZ"},
    {name:"GMT +4:30: Kabul",offset:"+04:30",location:"Kabul,AF"},
    {name:"GMT +5:00: Moscow+02 - Yekaterinburg",offset:"+05:00",location:"Yekaterinburg,RU"},
    {name:"GMT +5:00: Tashkent",offset:"+05:00",location:"Tashkent,UZ"},
    {name:"GMT +5:00: Karachi",offset:"+05:00",location:"Karachi,PK"},
    {name:"GMT +5:30: Colombo",offset:"+05:30",location:"Colombo,LK"},
    {name:"GMT +6:00: Almaty",offset:"+06:00",location:"Almaty,KZ"},
    {name:"GMT +6:00: Dhaka",offset:"+06:00",location:"Dhaka,BD"},
    {name:"GMT +6:30: Rangoon",offset:"+06:30",location:"Rangoon,MM"},
    {name:"GMT +7:00: Jakarta",offset:"+07:00",location:"Jakarta,ID"},
    {name:"GMT +7:00: Bangkok",offset:"+07:00",location:"Bankok,TH"},
    {name:"GMT +7:00: Moscow+04 - Krasnoyarsk",offset:"+07:00",location:"Krasnoyarsk,RU"},
    {name:"GMT +8:00: Western Time - Perth",offset:"+08:00",location:"Perth,AU"},
    {name:"GMT +8:00: Ulaanbaatar",offset:"+08:00",location:"Ulaanbaatar,MN"},
    {name:"GMT +8:00: China Time - Beijing",offset:"+08:00",location:"Beijing,CN"},
    {name:"GMT +8:00: Singapore",offset:"+08:00",location:"Singapore,SG"},
    {name:"GMT +8:00: Hong Kong",offset:"+08:00",location:"Hong Kong,CN"},
    {name:"GMT +8:00: Moscow+05 - Irkutsk",offset:"+08:00",location:"Irkutsk,RU"},
    {name:"GMT +8:00: Taipei",offset:"+08:00",location:"Taipei,TW"},
    {name:"GMT +8:00: Kuala Lumpur",offset:"+08:00",location:"Kuala Lumpur,MY"},
    {name:"GMT +9:00: Moscow+06 - Yakutsk",offset:"+09:00",location:"Yakutsk,RU"},
    {name:"GMT +9:00: Tokyo",offset:"+09:00",location:"Tokya,JP"},
    {name:"GMT +9:00: Seoul",offset:"+09:00",location:"Seol,KR"},
    {name:"GMT +9:30: Central Time - Darwin",offset:"+09:30",location:"Darwin,AU"},
    {name:"GMT +10:00: Moscow+07 - Magadan",offset:"+10:00",location:"Magadan,RU"},
    {name:"GMT +10:00: Moscow+07 - Yuzhno-Sakhalinsk",offset:"+10:00",location:"Yuzhno-Sakhalinsk,RU"},
    {name:"GMT +10:00: Guam",offset:"+10:00",location:"Guam,GU"},
    {name:"GMT +10:00: Port Moresby",offset:"+10:00",location:"Port Moresby,PG"},
    {name:"GMT +10:00: Eastern Time - Brisbane",offset:"+10:00",location:"Brisbane,AU"},
    {name:"GMT +10:30: Central Time - Adelaide",offset:"+10:30",location:"Adelaide,AU"},
    {name:"GMT +11:00: Guadalcanal",offset:"+11:00",location:"Guadalcanal,SB"},
    {name:"GMT +11:00: Eastern Time - Hobart",offset:"+11:00",location:"Hobart,AU"},
    {name:"GMT +11:00: Eastern Time - Melbourne",offset:"+11:00",location:"Melbourne,AU"},
    {name:"GMT +11:00: Eastern Time - Sydney",offset:"+11:00",location:"Sydney,AU"},
    {name:"GMT +11:00: Noumea",offset:"+11:00",location:"Noumea,NC"},
    {name:"GMT +12:00: Moscow+09 - Petropavlovsk-Kamchatskiy",offset:"+12:00",location:"Petropavlovsk-Kamchatskiy,RU"},
    {name:"GMT +12:00: Majuro",offset:"+12:00",location:"Majuro,MH"},
    {name:"GMT +13:00: Auckland",offset:"+13:00",location:"Auckland,NZ"},
    {name:"GMT +13:00: Tongatapu",offset:"+13:00",location:"Tongatapu,TO"},
    {name:"GMT +13:00: Fiji",offset:"+13:00",location:"Fiji,FJ"},
    {name:"GMT +13:00: Fakaofo",offset:"+13:00",location:"Fakaofo,TK"},
    {name:"GMT +14:00: Apia",offset:"+14:00",location:"Apia,WS"},
    {name:"GMT -1:00: Azores",offset:"-01:00",location:"Ponta Delgada,PT"},
    {name:"GMT -1:00: Cape Verde",offset:"-01:00",location:"Praia,CV"},
    {name:"GMT -2:00: Sao Paulo",offset:"-02:00",location:"Sao Paulo,BR"},
    {name:"GMT -2:00: South Georgia",offset:"-02:00",location:"King Edward Point,GS"},
    {name:"GMT -3:00: Godthab",offset:"-03:00",location:"Godthab,GL"},
    {name:"GMT -3:00: Buenos Aires",offset:"-03:00",location:"Buenosm Aires,AR"},
    {name:"GMT -3:00: Santiago",offset:"-03:00",location:"Santiago,CL"},
    {name:"GMT -3:00: Montevideo",offset:"-03:00",location:"Montevideo,UY"},
    {name:"GMT -3:30: Newfoundland Time - St. Johns",offset:"-03:30",location:"St. Johns,CA"},
    {name:"GMT -4:00: La Paz",offset:"-04:00",location:"La Paz,BO"},
    {name:"GMT -4:00: Atlantic Time - Halifax",offset:"-04:00",location:"Halifax,CA"},
    {name:"GMT -4:00: Guyana",offset:"-04:00",location:"Georgetown,GF"},
    {name:"GMT -4:30: Caracas",offset:"-04:30",location:"Caracas,VE"},
    {name:"GMT -5:00: Bogota",offset:"-05:00",location:"Bogota,CO"},
    {name:"GMT -5:00: Lima",offset:"-05:00",location:"Lima,PE"},
    {name:"GMT -5:00: Eastern Time",offset:"-05:00",location:"New York,NY,US"},
    {name:"GMT -6:00: Guatemala",offset:"-06:00",location:"Guatemala City,GT"},
    {name:"GMT -6:00: Central Time - Mexico City",offset:"-06:00",location:"Mexico City,MX"},
    {name:"GMT -6:00: Central Time",offset:"-06:00",location:"Chicago,IL,US"},
    {name:"GMT -6:00: Central Time - Regina",offset:"-06:00",location:"Regina,CA"},
    {name:"GMT -7:00: Mountain Time - Chihuahua Mazatlan",offset:"-07:00",location:"Chihuahua Mazatlan,MX"},
    {name:"GMT -7:00: Mountain Time",offset:"-07:00",location:"Denver,CO,US"},
    {name:"GMT -7:00: Mountain Time - Arizona",offset:"-07:00",location:"Tucson,AZ,US"},
    {name:"GMT -8:00: Pacific Time - Tijuana",offset:"-08:00",location:"Tijuana,MX"},
    {name:"GMT -8:00: Pacific Time",offset:"-08:00",location:"Seattle,WA,US"},
    {name:"GMT -10:00: Hawaii Time",offset:"-10:00",location:"Honolulu,HI,US"},
    {name:"GMT -11:00: Pago Pago",offset:"-11:00",location:"Pago Pago,AS"}
  ];

  return (
    <Page>
      <Section
        title={<Text bold align="center">Timezone Settings</Text>}>
        <Toggle
            settingsKey = "timeZoneToggle"
            label={`${props.settings.timeZoneToggle === 'true' ? 'Show' : 'Hide'} second timezone`}
           />
        <Select
          label =  "Select Time Zone"
          settingsKey="secondTimeZone"
          disable
          options={timeZoneSet}
          />
      </Section> 
      <Section
          title={<Text bold align="center">Weather Settings</Text>}>
           <Toggle
            label={`Temperature Unit: ${props.settings.tempUnitToggle === 'true' ? 'Celcius' : 'Fahrenheit'}`}
            settingsKey = "tempUnitToggle"
           />
      </Section>
      <Section
       title={<Text bold align="center">Progress Ring Settings</Text>}>
           <Toggle
            label={`Step measurement: ${props.settings.standGoalActive === 'true' ? 'Stand Goal' : 'Daily Steps'}`}
            settingsKey = "standGoalActive"
           />
      </Section>
      <Section
          title={<Text bold align="center">Other Settings</Text>}>
       <Toggle
            settingsKey = "batteryIconToggle"
            label={`${props.settings.batteryIconToggle === 'true' ? 'Show' : 'Hide'} battery status.`}
           />      
      <Button
        label="Reset Device Cache"
        onClick={() => props.settingsStorage.setItem("resetCache", "true")}
      />
       <Button
        label="Restore Default Settings"
        onClick={() => props.settingsStorage.setItem("resetSettings", "true")}
              />
    </Section>
  </Page>
  );
}

registerSettingsPage(mySettings);
