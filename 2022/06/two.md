\--- Part Two ---
-----------------

Your device's communication system is correctly detecting packets, but still isn't working. It looks like it also needs to look for _messages_.

A _start-of-message marker_ is just like a start-of-packet marker, except it consists of _14 distinct characters_ rather than 4.

Here are the first positions of start-of-message markers for all of the above examples:

*   `mjqjpqmgbljsphdztnvjfqwrcgsmlb`: first marker after character `_19_`
*   `bvwbjplbgvbhsrlpgdmjqwftvncz`: first marker after character `_23_`
*   `nppdvjthqldpwncqszvftbrmjlhg`: first marker after character `_23_`
*   `nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg`: first marker after character `_29_`
*   `zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw`: first marker after character `_26_`

_How many characters need to be processed before the first start-of-message marker is detected?_