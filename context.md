# Project Context

This project is a web application that serves as a dedicated system that can be used to manage the coffee drinking in our lab.

## Functionality

- Record coffee drinkings including time, coffee maker, cups, coffee beans
- Show statistics of coffee drinking in a dashboard which can also input/edit/delete coffee drinkings.
- Manage informations such as users (can also be coffee makers), coffee beans

## Intented Scenaios

- This system can be accessed by anyone in the lab under fireware, so we don't need to implement a authentication system.
- The system should be mobile friendly and screen adaptive (can be accessed on both desktop, taps, phones)
- The most cases of using this system is to record a coffee drinking, so the system should be very convenient to use. WE probably use it on a tablet placed near the coffee machine. The coffee maker can record a coffee drinking by use the touch screen of the tablet to input the information of the coffee drinking very quickly.


## Future work

- [ ] using more automatic way to record coffee drinking, for example, using QR code scan for recording coffee beans, cups
- [ ] Rankings: rating subsystem for coffee beans, cups, coffee makers, and users. 
- [ ] AI assistant to recommend coffee beans, cups, coffee makers, and users. for example, record a speech to record all infomations by calling LLM API.
- [ ] CI/CD for automatic deployment on Edge device.
- [ ] Notification system for coffee drinking intension collection for example, ask users if they want to drink coffee at a specific time.
