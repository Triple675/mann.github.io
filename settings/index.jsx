function mySettings(props) {
  return (
    <Page>
        <Section description={<Text>Color number 2 is grey by default. You can change this color here.</Text>} title={<Text>Settings for Color Nr. 2</Text>}>
          <Text>
            The watchface contains some color presets. Color number two is grey by default, but you can change this preset here by entering a hex-value (#rrggbb, i.e. #777777) for the main- and the gradient-color. A hex-value begins with a hashtag (#) and is followed by six characters. All characters may be digits (0 - 9) or letters (a - f). The first two characters are for red, the next two are for green and the last two are for blue. The entered string may not be shortened and must consist of the hashtag and another 6 characters. If you don't know what to do, please read a tutorial for hex-color-codes. If a wrong hex-color-code is entered, the defaut-color will be applied instead.
          </Text>
        </Section>
        <TextInput 
           label ="Main Color"
           placeholder="#777777"
           settingsKey="main"
         />
         <TextInput 
           label ="Gradient Color"
           placeholder="#777777"
           settingsKey="gradient"
         />
    </Page>
  );
}

registerSettingsPage(mySettings);
