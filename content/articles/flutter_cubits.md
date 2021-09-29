---
title: "Cubits in Flutter: A Practical Guide"
date: 2021-09-26T12:13:07+02:00
draft: false
---

# Cubits in Flutter: A Practical Guide

## Background
Creating Stateless apps in flutter is usually a fairly straightforward ordeal.
You can just code your app down top to bottom.

In the real world however, we often have to react to things.
Responses from APIs, databases, user input and a whole lot of other things make asynchronous and statefull behavior a nessecity in anything but the most basic of apps.

The built in solution for this by flutter is a statefull widget.
To update the state of something, you change your data and call `set state`.
Relavively straight forward.

The issue here is, that this entire aproach doesn't scale and you often end up needlessly passing around `set state` and random peices of data.

In flutter, developers therefore make use of the BLoC pattern (or rather the [library](https://pub.dev/packages/flutter_bloc) implementing it with the same name).
This greatly simplifies the process of managing and using state.

## The basics of BLoC
BLoC, stands for **B**usiness **Lo**gic **C**omponent.
Even though, we'll be focusing on it's approach to state management, the BLoC pattern can also greatly help with testing and decoupling business and ui logic.

When using the pattern, a widget allways knows about the BLoC that it relies on, as well as what state it is in (including all data relevant for your business logic).
If you change something in relation to the state, that state is emitted from the BLoC, updating all widgets that rely on it.

## Cubits
So where do cubits fit in all of this?
Cubits are basically a smaller version of BLoCs within the BLoC library, but are interoperable with all widget types of the library.
For most smaller usecases such as the ones in [my app](https://github.com/grossamos/weight_track_app), cubits completely suffice.

### Creating a cubit
In essence, you need two things for your cubit:
1. Some type of state object (this could also be an int, bool, etc.)
2. Your Cubit implementation

When talking about the actual state class, I would recomend creating an immutable class (this makes sure your changes to the state can only be done through the cubit class).
In the aformentioned app, an example for a state class could look as follows:
```dart
@immutable
class ExerciseLogState {
  final int _currentDay;
  final int selectedIndex;
  final Exercise selectedExercise;

  ExerciseLogState(this._currentDay, this.selectedIndex, this.selectedExercise);

  factory ExerciseLogState.initial(int idOfDay) {
    return ExerciseLogState(idOfDay, 0, Exercise(id: 0, name: 'Exercise'));
  }

  int get currentDay => _currentDay;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ExerciseLogState &&
          runtimeType == other.runtimeType &&
          _currentDay == other._currentDay &&
          selectedIndex == other.selectedIndex &&
          selectedExercise == other.selectedExercise;

  @override
  int get hashCode =>
      _currentDay.hashCode ^ selectedIndex.hashCode ^ selectedExercise.hashCode;
}
```
Hereby it is important to note, how hashcode and the ``==`` operator have to be implemented for the Cubit to recognise how (or if) it has changed after ``emit()`` is called.

The Cubit class then creates the state object and contains any methods relating to changes of state.
Within these methods, it is also vital to call ``emait()`` to register the change in state to all dependant widgets.
Again here an example of what said cubit could look like:
```dart
class ExerciseLogCubit extends Cubit<ExerciseLogState> {
  ExerciseLogCubit(int idOfDay) : super(ExerciseLogState.initial(idOfDay));

  void changeSelectedExercise(int index, Exercise exercise) {
    emit(ExerciseLogState(state.currentDay, index, exercise));
  }
}
```

## Using Cubits
In order the use our cubit to track state in our widget tree we three things:
1. BlocProvider
2. BlocBuilder
3. Some type of call to the Cubit that changes the state

The BlocProvider needs to sit at some type of root position in relation to all widgets, that need to use your state.
The main part here is just to create and initialize your cubit/state:
```dart
BlocProvider(
  create: (BuildContext context) => new ExerciseLogCubit(0),
  child: Container(
  	// cool stuff
  )
);
```

The BlocBuilder is where you register applications that actually use your state:
```dart
BlocBuilder<ExerciseLogCubit, ExerciseLogState>(
	builder: (BuildContext context, ExerciseLogState state) {
		return Container(
			// something that uses state
		);
	}
```

Hereby it is important to remember, that your Builder should be below your Provider in the Widget tree.

Finally, if your sate needs to change in relation to some type of button press or API response, you can call your Cubit's function by doing as follows:
```dart
context.read<ExerciseLogCubit>().changeSelectedExercise(0, new Exercise());
// or
BlocProvider.of<ExerciseLogCubit>(context).changeSelectedExercise(0, new Exercise());
```

## Conclusion
And that's pretty much it, you can now initialize use and react to any given state that your application can provide!

## Sources
- [BLoC library](https://bloclibrary.dev/)
- [flutterclutter.dev](https://www.flutterclutter.dev/flutter/basics/what-is-the-bloc-pattern/2021/2084/)
- [sample code](https://github.com/grossamos/homepage)




