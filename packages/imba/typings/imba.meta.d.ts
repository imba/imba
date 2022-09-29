declare namespace imbameta {
  interface tokens {
    /**
     * Refers to the special type of tag, self
     */
    "tag.name self": null;

    /**
     * Teleport to a global
     */
    "tag.name global": null;

    /**
     * Teleport tag
     * @detail something
     */
    "tag.name teleport": null;

    /**
     * Classname added to the element
     */
    "tag.flag": null;

    /**
     * [Event Modifiers Documentation](https://imba.io/docs/events/modifiers)
     */
    "tag.event-modifier.name": null;

    /**
     * [Event Handling Documentation](https://imba.io/docs/events)
     */
    "tag.event.name": null;

    /**
     * Regular assignment that returns true or false depending on whether the left-hand was changed or not.
     */
    "operator.assign.=? ": boolean;

    /**
     * See [Meta Properties Docs](https://imba.io/docs/identifiers#meta-properties)
     */
    "identifier.symbolx": null;


    // TODO: Add all units from MDN (https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)

    /**
     * Pixel style unit
     */
    "style.value.unit px": string;
    /**
     * Pt style unit
     */
    "style.value.unit pt": string;

    /** Ch */
    "style.value.unit ch": string;

    /** ex */
    "style.value.unit ex": string;
    /** rem */
    "style.value.unit rem": string;
    /** em */
    "style.value.unit em": string;
    /** vw */
    "style.value.unit vw": string;
    /** vh */
    "style.value.unit vh": string;

    /** vw */
    "style.value.unit s": string;
    /** vw */
    "style.value.unit ms": string;

    // Number units

    /**
     * Milliseconds
     */
    "unit ms": number;

    /**
     * Seconds. Compiles to n * 1000 (milliseconds in one second)
     */
    "unit s": number;

    /**
     * Days. Compiles to n * 60000 (milliseconds in one minute)
     */
    "unit minutes": number;

    /**
     * Hours. Compiles to n * 3600000 (milliseconds in 1 hour)
     */
    "unit hours": number;

    /**
     * Days. Compiles to n * 86400000 (milliseconds in one day)
     */
    "unit days": number;

    /**
     * Frames per second. Compiles to 1000 / n
     * Ie 60fps => 1000 / 60.
     */
    "unit fps": number;

    /**
     * Pixels
     */
    "unit px": string;
  }
}
