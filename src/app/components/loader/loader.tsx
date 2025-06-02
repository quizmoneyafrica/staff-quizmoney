import React from "react";

function AppLoader() {
	return (
		<div className="h-screen flex items-center justify-center bg-white">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
		</div>
	);
}

export default AppLoader;
