with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

old_closing = """                    </div>
                  ))
                )}
              </div>
            </div>"""

new_closing = """                    </div>
                  ));
                })()}
              </div>
            </div>"""

code = code.replace(old_closing, new_closing)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
