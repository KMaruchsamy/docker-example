export class BoldText{

    constructor() {
    }
    getTextBold(strtext: string) {
        /* Get the text of the element I'm after */
        let boldText = strtext.trim(),
            openSpan = '<b>', closeSpan = '</b>';

        /* Make the paragraph into an array */
        boldText = boldText.split(' ');

        /* Add b tag to the beginning of the array */
        boldText.unshift(openSpan);

        /* Add  as the 4th value in the array */
        boldText.splice(6, 0, closeSpan);

        /* Turn it back into a string */
        boldText = boldText.join(' ');

        /* Append the new HTML to the paragraph */
        $('.js-bolded').html(boldText);
    }
}