var LinkedLIstItem = function (value, uid, next, back) {
	this.next = next;
	this.value = value;
	this.back = back;
	this.UID = uid;
	return this;
};

var LinkedLIst = function (queueLength) {
	/// <summary>Creates a circular queue of specified length</summary>
	/// <param name="queueLength" type="int">Length of the circular queue</type>
	this._current = new LinkedLIstItem(undefined, undefined, undefined);
	var item = this._current;
	this._first = this._current;
	for (var i = 0; i < queueLength - 1; i++) {
		item.next = new LinkedLIstItem(undefined, i, undefined, item);
		item = item.next;
	}
	item.next = this._current;
	this._current.back = item;

	this.push = function (value) {
		/// <summary>Pushes a value/object into the circular queue</summary>
		/// <param name="value">Any value/object that should be stored into the queue</param>
		this._current.value = value;
		this._current = this._current.next;
	};
	
	this.pop = function () {
		/// <summary>Gets the last pushed value/object from the circular queue</summary>
		/// <returns>Returns the last pushed value/object from the circular queue</returns>
		this._current = this._current.back;
		return this._current.value;
	};
	
	this.each = function(callback) {
		/// <summary>Iterates from first to last element in LinkedList and executes callback function for each value</summary>
		/// <param name="value">Callback function</param>
		
	}
	return this;
}
