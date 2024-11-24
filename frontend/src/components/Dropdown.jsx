import React from 'react';

const Dropdown = ({ label, name, options, register, ...props }) => {
  return (
    <div className="mb-4">
      <label className="inline-block mb-1 pl-1" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        {...register(name, { required: true })}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        defaultValue=""
        placeholder="Select designation"
      >
        <option value="" disabled className="text-gray-400">Select designation</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;