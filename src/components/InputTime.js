import React from 'react';
import {HOUR_FIELD, MIN_FIELD} from '../constants/InputTime'
import './InputTime.css'


class InputTime extends React.Component {
  
    constructor(props) {

        super(props); 

        this.state = {
            ownID: this.generateID(),
            hour: '',
            min: '',
            cursor: {
                field: '',
                pos: 0
            },
        }
        
        document.addEventListener('focusin', this.checkFocusOutside);   // Check if cursor left the InputTime component
        document.addEventListener('click', this.checkFocusOutside);     // Clicking on the document but not on DOM element does not fire 'focusin', so this additional check is needed
    }

    // Generate unique id 
    generateID = () => Math.random().toString(36).substr(2, 10) + Math.floor(Math.random()*1000);

    // Validate hour
    isHourValid = (hour) => (/^([0-9]|[01][0-9]|2[0-3]|)$/).test(hour);

    // Validate minute
    isMinValid = (min) => (/^([0-9]|[0-5][0-9]|)$/).test(min);

    // Handle the changes in the hour part of the time
    // --------------------------------------------------   
    handleHourChange = (e) => {

        let newHour = e.target.value;
        const currentCursorPos = e.target.selectionStart;
        const {hour, cursor} = this.state;

        if (newHour.length > 2) {
            newHour = (cursor.pos === 0) ? newHour.charAt(0) + newHour.charAt(2) : newHour.slice(0,2);    
        }

        if (this.isHourValid(newHour)) {
            if ((currentCursorPos >= 2) || (newHour >= 3 && newHour <= 9)) {
                cursor.field = MIN_FIELD;
                cursor.pos = 0;  
            } else {
                cursor.field = HOUR_FIELD;
                cursor.pos = currentCursorPos;
            }
        } else {
            cursor.field = HOUR_FIELD;
            cursor.pos = currentCursorPos - 1;
            newHour = hour;
        }

        this.setState({ hour: newHour, cursor }); 
    }
    
    // Handle the changes in the minute part of the time
    // --------------------------------------------------
    handleMinChange = (e) => {

        let newMin = e.target.value;
        const currentCursorPos = e.target.selectionStart;
        const {min, cursor} = this.state;

        if (newMin.length > 2) {
            newMin = (cursor.pos === 0) ? newMin.charAt(0) + newMin.charAt(2) : newMin.slice(0,2);
        }

        if (this.isMinValid(newMin)) {
            cursor.field = MIN_FIELD;
            cursor.pos = currentCursorPos;    
        } else {
            cursor.field = MIN_FIELD;
            cursor.pos = currentCursorPos - 1;  
            newMin = min;
        }

        this.setState({ min: newMin, cursor }); 
    }
    
    // Catch and handle "Arrow-Right" and "Delete" key press in the hour field 
    // ------------------------------------------------------------------------
    handleHourKeyDown = (e) => {

        const { hour, min } = this.state;
        const currentCursorPos = e.target.selectionStart;
        const cursorEnd = e.target.selectionEnd;
        const isSelection = currentCursorPos-cursorEnd !== 0;

        if ((hour.length === currentCursorPos) && (e.key === 'ArrowRight')) {
            e.preventDefault();
            this.setState({
                cursor: { field: MIN_FIELD, pos: 0 }
            });
        } else if ((hour.length === currentCursorPos) && (e.key === 'Delete')) {
            this.setState({
                min: min.slice(1),
                cursor: { field: HOUR_FIELD, pos: 2 }
            });
        } else if (!isSelection) {
            this.setState({
                cursor: { field: HOUR_FIELD, pos: currentCursorPos}
            });   
        }
    }

    // Catch and handle "Arrow-Left" and "Backspace" key press in the minute field
    // ------------------------------------------------------------------------------------------
    handleMinKeyDown = (e) => {

        const currentCursorPos = e.target.selectionStart;
        const cursorEnd = e.target.selectionEnd;
        const isSelection = currentCursorPos-cursorEnd !== 0;

        if (currentCursorPos === 0 && !isSelection && (e.key === 'ArrowLeft' || e.key === 'Backspace')) {
            e.preventDefault();
            this.setState({
                cursor: { field: HOUR_FIELD, pos: 2 }
            });  
        } else if (!isSelection) {
            this.setState({
                cursor: { field: MIN_FIELD, pos: currentCursorPos }
            });
        }
    }

    // Add leading zero to hour if necessary when leaving the hour field
    // ------------------------------------------------------------------
    handleHourLeave = (e) => {

        const { hour } = this.state;

        if (hour.length === 1) {

            this.setState({
                hour: hour.padStart(2,'0'),
                cursor: { field: '',  pos: 0}
            });
        }
    }

    // Add leading zero to minute if necessary when leaving the minute field
    // ------------------------------------------------------------------
    handleMinLeave = (e) => {

        const { min } = this.state;

        if (min.length === 1) {
            this.setState({
                min: min.padStart(2,'0'),
                cursor: { field: '', pos: 0  }
            });
        }
    }
    
    // Check if the cursor is outside of the InputTime component
    // ------------------------------------------------------------------
    checkFocusOutside = (e) => {

        const {ownID, hour, min } = this.state;
        const isFocusOutside = !(e.target.id === `${ownID}-Hour` || e.target.id === `${ownID}-Min`)
        const isUpdateNeeded = ((hour.length !== 0 || min.length !== 0) && (hour.length < 2 || min.length < 2));

        if ((isFocusOutside) && (isUpdateNeeded)) {
            this.setState({ 
                hour: hour.padStart(2,'0'), 
                min: min.padStart(2,'0'), 
                cursor: { field: '', pos: 0  }
            });    
        }
    }

    // Reinstate the cursor position once the new value has been rendered
    // ------------------------------------------------------------------
    componentDidUpdate = () => {

        const currentCursorPos = this.state.cursor.pos;

        switch (this.state.cursor.field) {
            case HOUR_FIELD:
                this.hourInput.focus();
                this.hourInput.setSelectionRange(currentCursorPos,currentCursorPos);
                break;
            case MIN_FIELD:
                this.minuteInput.focus();
                this.minuteInput.setSelectionRange(currentCursorPos,currentCursorPos);
                break;
            default:
                // do nothing
        } 
    }

    // Display the InputTime component
    // ------------------------------------------------------------------
    render() {

        const { ownID, hour, min } = this.state;
        const { id, placeholder } = this.props;

        const time = hour + ':' + min;
        const placeholderHour = placeholder && placeholder.hour ? placeholder.hour : undefined;
        const placeholderMin = placeholder && placeholder.min ? placeholder.min : undefined;

        return (
            <div 
                id={`${ownID}-Container`}
                className="input-time"
            >
                <input 
                    id={`${ownID}-Hour`}
                    type="text"
                    className="input-time-hour" 
                    placeholder={placeholderHour}
                    value={hour} 
                    onKeyDown={this.handleHourKeyDown}
                    onChange={this.handleHourChange}
                    onBlur={this.handleHourLeave}
                    ref={input => { this.hourInput = input; }}
                />
                <input
                    id={`${ownID}-Sep`}
                    className="input-time-sep" 
                    value=":" 
                    disabled 
                />
                <input 
                    id={`${ownID}-Min`}
                    type="text"
                    className="input-time-min" 
                    placeholder={placeholderMin}
                    value={min} 
                    onKeyDown={this.handleMinKeyDown}
                    onChange={this.handleMinChange} 
                    onBlur={this.handleMinLeave}
                    ref={input => { this.minuteInput = input; }}
                />
                <input type="hidden" id={id} value={time}/>
            </div>
        );
    }
}
  
export default InputTime;